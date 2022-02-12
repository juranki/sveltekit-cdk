import { Construct } from 'constructs'
import { Duration, IgnoreMode } from 'aws-cdk-lib'
import * as cdn from 'aws-cdk-lib/aws-cloudfront'
import * as cdnOrigins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as s3 from 'aws-cdk-lib/aws-s3'
import { DEFAULT_ARTIFACT_PATH, RendererProps, StaticRoutes, SvelteRendererEndpoint } from './common'
import { writeFileSync, readdirSync, statSync, existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { buildSync } from 'esbuild'
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { CacheControl } from 'aws-cdk-lib/aws-codepipeline-actions'
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment'

export interface SvelteDistributionProps {
    /**
     * Location of sveltekit artifacts
     * 
     * @default 'sveltekit'
     */
    artifactPath?: string

    /**
     * Renderer configuration for this site.
     * If the type is SERVICE, endpoint must be provided
     */
    renderer: {
        /**
         * NONE is for fully static sveltekit sites
         * 
         * VIEWER_REQ deploys renderer as Lambda@Edge function
         * that is attached to Cloudfront distribution as **viewer
         * request handler**. rendererProps must be provided
         * 
         * ORIGIN_REQ deploys renderer as Lambda@Edge function
         * that is attached to Cloudfront distribution as **origin
         * request handler**. rendererProps must be provided
         * 
         * HTTP_ORIGIN attaches renderer to distribution as HttpOrigin
         * of default behaviour. You must provide the endpoint attribute.
         * 
         * To learn more about Cloudfront request handling, see
         * https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-cloudfront-trigger-events.html.
         */
        type: 'NONE' | 'VIEWER_REQ' | 'ORIGIN_REQ' | 'HTTP_ORIGIN',
        /**
         * EndPoint for the renderer service
         */
        endpoint?: SvelteRendererEndpoint
        /**
         * Props for Lambda@Edge renderer
         */
        rendererProps?: RendererProps
    }

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
     * @default allow all for lambda@edge, otherwise minimal policy to make the sveltekit demo work (userid cookie, Accept header, all query str params)
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


        // origins
        const bucketProps = props.bucketProps || {}
        this.bucket = new s3.Bucket(this, 'svelteStaticBucket', bucketProps);

        const s3static = new cdnOrigins.S3Origin(this.bucket, {
            originPath: 'static'
        })
        const s3prerendered = new cdnOrigins.S3Origin(this.bucket, {
            originPath: 'prerendered'
        })
        const origin = props.renderer.type === 'HTTP_ORIGIN'
            ? new cdnOrigins.HttpOrigin(props.renderer.endpoint!.httpEndpoint)
            : s3prerendered

        // cache and origin request policies
        const originRequestPolicy = props.originRequestPolicy || new cdn.OriginRequestPolicy(this, 'svelteDynamicRequestPolicy', {
            cookieBehavior: cdn.OriginRequestCookieBehavior.all(),
            headerBehavior: cdn.OriginRequestHeaderBehavior.allowList('Accept'),
            queryStringBehavior: cdn.OriginRequestQueryStringBehavior.all(),
        })
        const cachePolicy = props.cachePolicy || cdn.CachePolicy.CACHING_OPTIMIZED

        // at edge lambda
        let edgeLambdas: cdn.EdgeLambda[] | undefined = undefined
        if (props.renderer.type === 'VIEWER_REQ' || props.renderer.type === 'ORIGIN_REQ') {

            const envCode = props.renderer.rendererProps?.environment ?
                Object.entries(props.renderer.rendererProps.environment)
                    .map(([k, v]) => (`process.env["${k}"]="${v}";`))
                    .join('\n') :
                ''

            const artifactPath = props?.artifactPath || DEFAULT_ARTIFACT_PATH
            const bundleDir = join(artifactPath, 'lambda/at-edge-env')
            const envFile = join(artifactPath, 'lambda/env.js')
            const outfile = join(bundleDir, 'handler.js')
            writeFileSync(envFile, envCode)
            const code = buildSync({
                entryPoints: [join(artifactPath, 'lambda/at-edge/handler.js')],
                outfile,
                bundle: true,
                platform: 'node',
                inject: [envFile],
            })
            if (code.errors.length > 0) {
                console.log('bundling lambda failed')
                throw new Error(code.errors.map(e => (e.text)).join('\n'));
            }

            this.function = new cdn.experimental.EdgeFunction(this, 'svelteHandler', {
                code: lambda.Code.fromAsset(bundleDir),
                handler: 'handler.handler',
                runtime: lambda.Runtime.NODEJS_14_X,
                timeout: Duration.seconds(5),
                logRetention: 7,
            })

            edgeLambdas = [{
                eventType: props.renderer.type === 'ORIGIN_REQ'
                    ? cdn.LambdaEdgeEventType.ORIGIN_REQUEST
                    : cdn.LambdaEdgeEventType.VIEWER_REQUEST,
                functionVersion: this.function.currentVersion,
                includeBody: true,
            }]
        }

        // distribution
        this.distribution = new cdn.Distribution(this, 'distro', {
            priceClass: props.priceClass || cdn.PriceClass.PRICE_CLASS_100,
            defaultRootObject: 'index.html',
            defaultBehavior: props.renderer.type === 'HTTP_ORIGIN' ? {
                origin,
                viewerProtocolPolicy: cdn.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                allowedMethods: cdn.AllowedMethods.ALLOW_ALL,
                originRequestPolicy,
                cachePolicy,
            } : {
                origin,
                viewerProtocolPolicy: cdn.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                edgeLambdas,
                allowedMethods: edgeLambdas ? cdn.AllowedMethods.ALLOW_ALL : cdn.AllowedMethods.ALLOW_GET_HEAD,
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
                if (props.renderer.type === 'HTTP_ORIGIN') {
                    this.distribution.addBehavior(glob, s3prerendered, {
                        viewerProtocolPolicy: cdn.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
                    })
                }
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
                contentType: 'text/html',
                distributionPaths: Object.entries(routes).filter(([_, t]) => (t === 'prerendered')).map(([r, _]) => `/${r}`),
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
    if (props.renderer.type === 'HTTP_ORIGIN' && !props.renderer.endpoint) {
        throw new Error("renderer endpoint must be provided when type is SERVICE")
    }
    if ((props.renderer.type.endsWith('_REQ')) && !props.renderer.rendererProps) {
        throw new Error("rendererProps must be provided when type is VIEWER_REQ or ORIGIN_REQ")
    }

    if (props.certificateArn && !props.domainNames) {
        throw new Error("domainNames must be provided when setting a certificateArn")
    }
}
