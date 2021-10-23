import {
    AllowedMethods,
    CachePolicy,
    Distribution,
    EdgeLambda,
    ICachePolicy,
    IOriginRequestPolicy,
    LambdaEdgeEventType,
    OriginRequestCookieBehavior,
    OriginRequestHeaderBehavior,
    OriginRequestPolicy,
    OriginRequestQueryStringBehavior,
    PriceClass,
    ViewerProtocolPolicy
} from '@aws-cdk/aws-cloudfront'
import { HttpOrigin, S3Origin } from '@aws-cdk/aws-cloudfront-origins'
import { Bucket } from '@aws-cdk/aws-s3'
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment'
import { Construct } from '@aws-cdk/core'
import { DEFAULT_ARTIFACT_PATH, RendererProps, SvelteRendererEndpoint } from './common'
import { readdirSync, statSync } from 'fs'
import { join } from 'path'
import { EdgeFunction } from '@aws-cdk/aws-cloudfront/lib/experimental'
import { Code, Runtime } from '@aws-cdk/aws-lambda'

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
         * NONE assumes you sveltekit is configured for
         * fully static site
         * 
         * AT_EDGE deploys renderer as Lambda@Edge function
         * which is attached to Cloudfront distribution.
         * rendererProps must be provided
         * 
         * SERVICE means that renderer is available 
         * as a service, and you must provide the endpoint
         */
        type: 'NONE' | 'AT_EDGE' | 'SERVICE',
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
    priceClass?: PriceClass
    /**
     * Origin request policy determines which parts of requests
     * CloudFront passes to your backend
     * 
     * @default minimal policy to make the sveltekit demo work (userid cookie, Accept header, all query str params)
     * @link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/controlling-origin-requests.html
     */
    originRequestPolicy?: IOriginRequestPolicy

    /**
     * Cache policy determies caching for dynamic content.
     * 
     * Note: static content is cached using default setting (CACHING_OPTIMIZED).
     * 
     * @default CACHING_DISABLED
     * @link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/controlling-origin-requests.html
     */
    cachePolicy?: ICachePolicy
}

export class SvelteDistribution extends Construct {
    distribution: Distribution
    bucket: Bucket
    constructor(scope: Construct, id: string, props: SvelteDistributionProps) {
        super(scope, id)

        // validate pros and apply defaults
        checkProps(props)
        const artifactPath = props.artifactPath || DEFAULT_ARTIFACT_PATH
        const staticPath = join(artifactPath, 'static')

        // origins
        this.bucket = new Bucket(this, 'svelteStaticBucket')
        const s3origin = new S3Origin(this.bucket)
        const origin = props.renderer.type === 'SERVICE'
            ? new HttpOrigin(props.renderer.endpoint!.httpEndpoint)
            : s3origin

        // cache and origin request policies
        const originRequestPolicy = props.originRequestPolicy || new OriginRequestPolicy(this, 'svelteDynamicRequestPolicy', {
            cookieBehavior: OriginRequestCookieBehavior.allowList('userid'),
            headerBehavior: OriginRequestHeaderBehavior.allowList('Accept'),
            queryStringBehavior: OriginRequestQueryStringBehavior.all(),
        })
        const cachePolicy = props.cachePolicy || CachePolicy.CACHING_DISABLED

        // at edge lambda
        let edgeLambdas: EdgeLambda[] | undefined = undefined
        if (props.renderer.type === 'AT_EDGE') {
            const lambda = new EdgeFunction(this, 'svelteHandler', {
                code: Code.fromAsset(
                    join(artifactPath, 'server/at-edge')),
                handler: 'handler.handler',
                runtime: Runtime.NODEJS_14_X,
                environment: props.renderer.rendererProps?.environment,
                logRetention: 7,
            })

            edgeLambdas = [{
                eventType: LambdaEdgeEventType.VIEWER_REQUEST,
                functionVersion: lambda.currentVersion,
                includeBody: true,
            }]
        }

        // distribution
        this.distribution = new Distribution(this, 'distro', {
            priceClass: props.priceClass || PriceClass.PRICE_CLASS_100,
            defaultBehavior: props.renderer.type === 'SERVICE' ? {
                origin,
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                allowedMethods: AllowedMethods.ALLOW_ALL,
                originRequestPolicy,
                cachePolicy,
            } : {
                origin,
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                edgeLambdas,
                allowedMethods: edgeLambdas ? AllowedMethods.ALLOW_ALL : AllowedMethods.ALLOW_GET_HEAD,
                originRequestPolicy: edgeLambdas ? originRequestPolicy : undefined,
                cachePolicy: edgeLambdas ? cachePolicy : undefined
            }
        })

        // routes for static content
        if (props.renderer.type === 'SERVICE' || props.renderer.type === 'AT_EDGE') {
            forStaticRoutes(staticPath, (pattern) => {
                this.distribution.addBehavior(pattern, s3origin, {
                    viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                })
            })
        }

        // deploy static content
        new BucketDeployment(this, 'svelteStaticDeployment', {
            destinationBucket: this.bucket,
            sources: [Source.asset(staticPath)],
            distribution: this.distribution,
        })

    }
}

function checkProps(props: SvelteDistributionProps) {
    if (props.renderer.type === 'SERVICE' && !props.renderer.endpoint) {
        throw new Error("renderer endpoint must be provided when type is SERVICE")
    }
    if (props.renderer.type === 'AT_EDGE' && !props.renderer.rendererProps) {
        throw new Error("rendererProps must be provided when type is AT_EDGE")
    }
}

function forStaticRoutes(staticPath: string, cb: (pattern: string) => void): void {
    readdirSync(staticPath).map(f => {
        const fullPath = join(staticPath, f)
        const stat = statSync(fullPath)
        if (stat.isDirectory()) {
            cb(`/${f}/*`)
        } else {
            cb(`/${f}`)
        }
    })
}
