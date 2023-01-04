import { Construct } from 'constructs'
import { Duration } from 'aws-cdk-lib'
import * as cdn from 'aws-cdk-lib/aws-cloudfront'
import * as cdnOrigins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as s3 from 'aws-cdk-lib/aws-s3'
import { DEFAULT_ARTIFACT_PATH, RendererProps, StaticRoutes } from './common'
import { readFileSync } from 'fs'
import { join } from 'path'
import { buildSync } from 'esbuild'
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { CacheControl } from 'aws-cdk-lib/aws-codepipeline-actions'
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment'
import { randomBytes } from 'crypto'

export interface SvelteDistributionProps {
    /**
     * Location of sveltekit artifacts
     * 
     * @default 'sveltekit'
     */
    artifactPath?: string

    /**
     * Props for Lambda@Edge renderer
     */
    rendererProps?: RendererProps

    /**
     * PriceClass
     * 
     * @link https://docs.aws.amazon.com/cdk/api/latest/typescript/api/aws-cloudfront/priceclass.html#aws_cloudfront_PriceClass
     * @default PriceClass.PRICE_CLASS_100
     */
    priceClass?: cdn.PriceClass
    /**
     * Origin request policy determines which parts of requests
     * CloudFront passes to your backend
     * 
     * @default AllViewer managed policy
     * @link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/controlling-origin-requests.html
     */
    originRequestPolicy?: cdn.IOriginRequestPolicy

    /**
     * Cache policy determies caching for dynamic content.
     * 
     * Note: static content is cached using default setting (CACHING_OPTIMIZED).
     * 
     * @default CACHING_DISABLED
     * @link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/controlling-origin-requests.html
     */
    cachePolicy?: cdn.ICachePolicy

    /**
     * Bucket props for the svelteStaticBucket s3 bucket.
     *
     * @link https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-s3.BucketProps.html
     */
    bucketProps?: s3.BucketProps

    /**
     * Certificate to use with the CloudFront Distribution
     * 
     * @default undefined
     */
    certificateArn?: string

    /**
     * Domain names to associate with the CloudFront Distribution
     * 
     * @default undefined
     */
    domainNames?: Array<string>
}

export class SvelteDistribution extends Construct {
    distribution: cdn.Distribution
    bucket: s3.Bucket
    function?: cdn.experimental.EdgeFunction
    constructor(scope: Construct, id: string, props: SvelteDistributionProps) {
        super(scope, id)

        // validate pros and apply defaults
        checkProps(props)
        const artifactPath = props.artifactPath || DEFAULT_ARTIFACT_PATH
        const staticPath = join(artifactPath, 'static')
        const prerenderedPath = join(artifactPath, 'prerendered')
        const routesPath = join(artifactPath, 'routes.json')
        const routes: StaticRoutes = JSON.parse(readFileSync(routesPath, { encoding: 'utf8' }))
        const envUtils = new EnvUtil(props.rendererProps?.environment || {})
        

        // origins
        const bucketProps = props.bucketProps || {}
        this.bucket = new s3.Bucket(this, 'svelteStaticBucket', bucketProps);

        const s3static = new cdnOrigins.S3Origin(this.bucket, {
            originPath: 'static'
        })
        const origin = new cdnOrigins.S3Origin(this.bucket, {
            originPath: 'prerendered',
            customHeaders: envUtils.customHeaders(),
        })
        
        // cache and origin request policies
        const originRequestPolicy = props.originRequestPolicy || cdn.OriginRequestPolicy.ALL_VIEWER
        const cachePolicy = props.cachePolicy || new cdn.CachePolicy(this, 'svelteDynamicCachePolicy', {
            cookieBehavior: cdn.CacheCookieBehavior.all(),
        })

        // at edge lambda
        let edgeLambdas: cdn.EdgeLambda[] | undefined = undefined

        const bundleDir = join(artifactPath, 'lambda/at-edge-env')
        const outfile = join(bundleDir, 'handler.js')
        const code = buildSync({
            entryPoints: [join(artifactPath, 'lambda/at-edge/handler.js')],
            outfile,
            bundle: true,
            platform: 'node',
            target: ['es2020'],
            define: {
                SVELTEKIT_CDK_LOG_LEVEL: JSON.stringify(props.rendererProps?.logLevel || 'INFO'),
                SVELTEKIT_CDK_ENV_MAP: envUtils.mappingJSON(),
            }
        })
        if (code.errors.length > 0) {
            console.log('bundling lambda failed')
            throw new Error(code.errors.map(e => (e.text)).join('\n'));
        }

        this.function = new cdn.experimental.EdgeFunction(this, 'svelteHandler', {
            code: lambda.Code.fromAsset(bundleDir),
            handler: 'handler.handler',
            runtime: lambda.Runtime.NODEJS_16_X,
            timeout: Duration.seconds(5),
            memorySize: 512,
            logRetention: 7,
        })

        edgeLambdas = [{
            eventType: cdn.LambdaEdgeEventType.ORIGIN_REQUEST,
            functionVersion: this.function.currentVersion,
            includeBody: true,
        }]

        // distribution
        this.distribution = new cdn.Distribution(this, 'distro', {
            priceClass: props.priceClass || cdn.PriceClass.PRICE_CLASS_100,
            defaultBehavior: {
                origin,
                viewerProtocolPolicy: cdn.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                edgeLambdas,
                allowedMethods: cdn.AllowedMethods.ALLOW_ALL,
                originRequestPolicy: edgeLambdas ? originRequestPolicy : undefined,
                cachePolicy: edgeLambdas ? cachePolicy : undefined,
            },
            domainNames: props.domainNames ? props.domainNames : undefined,
            certificate: props.certificateArn ? Certificate.fromCertificateArn(this, 'domainCert', props.certificateArn) : undefined,
        })

        let hasPrerendered = false
        // routes for static content
        Object.entries(routes).forEach(([glob, origin]) => {
            if (origin === 'static') {
                this.distribution.addBehavior(glob, s3static, {
                    viewerProtocolPolicy: cdn.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
                })
            } else if (origin === 'prerendered') {
                hasPrerendered = true
            }
        })

        if (hasPrerendered) {
            // deploy with explicit content type to set it correctly for prerendered
            new BucketDeployment(this, 'sveltePrerenderedDeployment', {
                destinationBucket: this.bucket,
                destinationKeyPrefix: 'prerendered',
                sources: [Source.asset(prerenderedPath)],
                distribution: this.distribution,
                cacheControl: [
                    CacheControl.maxAge(Duration.days(365))
                ],
                distributionPaths: Object.entries(routes).filter(([_, t]) => (t === 'prerendered')).map(([r, _]) => r),
            })

        }

        new BucketDeployment(this, 'svelteStaticDeployment', {
            destinationBucket: this.bucket,
            destinationKeyPrefix: 'static',
            sources: [Source.asset(staticPath)],
            distribution: this.distribution,
            cacheControl: [
                CacheControl.maxAge(Duration.days(365))
            ],
            distributionPaths: Object.entries(routes).filter(([_, t]) => (t === 'static')).map(([r, _]) => `/${r}`),
        })
    }
}

function checkProps(props: SvelteDistributionProps) {
    if (props.certificateArn && !props.domainNames) {
        throw new Error("domainNames must be provided when setting a certificateArn")
    }
}

/**
 * Prepare structures for passing env vars into Lambda@Edge
 */
class EnvUtil {
    values: Record<string,string>
    headers: Record<string,string>
    
    constructor(env:Record<string,string>) {
        this.values = env
        this.headers = Object.fromEntries(
            Object.keys(env).map(k => [k, `x-env-${randomBytes(9).toString('hex')}`])
        )
    }

    mappingJSON = () => {
        return JSON.stringify(Object.fromEntries(
            Object.entries(this.headers).map(([k,v]) => ([v,k]))))
    }

    customHeaders = () => {
        return Object.fromEntries(Object.entries(this.values).map(([k,v]) => (
            [this.headers[k], v]
        )))
    }
}

