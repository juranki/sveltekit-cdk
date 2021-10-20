import {
    AllowedMethods,
    CachePolicy,
    Distribution,
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
import { SvelteBackend } from './backend'
import { readdirSync, statSync } from 'fs'
import { join } from 'path'

export interface SvelteDistributionProps {
    /**
     * Location of sveltekit artifacts
     * 
     * @default 'sveltekit'
     */
    artifactPath: string

    /**
     * Optional backend resource.
     * 
     * If defined, will be the default handler that receives requests
     * that don't match static content.
     */
    backend?: SvelteBackend
    /**
     * PriceClass
     * 
     * @link https://docs.aws.amazon.com/cdk/api/latest/typescript/api/aws-cloudfront/priceclass.html#aws_cloudfront_PriceClass
     * @default PriceClass.PRICE_CLASS_100
     */
    priceClass?: PriceClass
}

export class SvelteDistribution extends Construct {
    distribution: Distribution
    bucket: Bucket
    constructor(scope: Construct, id: string, props: SvelteDistributionProps) {
        super(scope, id)

        this.bucket = new Bucket(this, 'svelteStaticBucket')

        const artifactPath = props.artifactPath || 'sveltekit'
        const staticPath = join(artifactPath, 'static')

        const origin = props.backend ? new HttpOrigin(props.backend.httpEndpoint) : new S3Origin(this.bucket)

        this.distribution = new Distribution(this, 'distro', {
            priceClass: props.priceClass || PriceClass.PRICE_CLASS_100,
            defaultBehavior: props.backend ? {
                origin,
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                allowedMethods: AllowedMethods.ALLOW_ALL,
                originRequestPolicy: new OriginRequestPolicy(this, 'svelteDynamicRequestPolicy', {
                    cookieBehavior: OriginRequestCookieBehavior.allowList('userid'),
                    headerBehavior: OriginRequestHeaderBehavior.allowList('Accept'),
                    queryStringBehavior: OriginRequestQueryStringBehavior.all(),
                }),
                cachePolicy: CachePolicy.CACHING_DISABLED,
            } : {
                origin,
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            }
        })

        if (props.backend) {
            const s3origin = new S3Origin(this.bucket)
            forStaticRoutes(staticPath, (pattern) => {
                this.distribution.addBehavior(pattern, s3origin, {
                    viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                })
            })
        }

        const staticDeployment = new BucketDeployment(this, 'svelteStaticDeployment', {
            destinationBucket: this.bucket,
            sources: [Source.asset(staticPath)],
            distribution: this.distribution,
        })

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
