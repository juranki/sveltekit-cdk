import { randomBytes } from 'crypto';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { SvelteKitCDKArtifact } from '@sveltekit-cdk/artifact';
import { Duration } from 'aws-cdk-lib';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import * as cdn from 'aws-cdk-lib/aws-cloudfront';
import * as cdnOrigins from 'aws-cdk-lib/aws-cloudfront-origins';
import { CacheControl } from 'aws-cdk-lib/aws-codepipeline-actions';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import { DEFAULT_ARTIFACT_PATH, RendererProps } from './common';

export interface SvelteDistributionProps {
  /**
   * Location of sveltekit artifacts
   *
   * @default 'sveltekit'
   */
  readonly artifactPath?: string;

  /**
   * Props for Lambda@Edge renderer
   */
  readonly rendererProps?: RendererProps;

  /**
   * PriceClass
   *
   * @link https://docs.aws.amazon.com/cdk/api/latest/typescript/api/aws-cloudfront/priceclass.html#aws_cloudfront_PriceClass
   * @default PriceClass.PRICE_CLASS_100
   */
  readonly priceClass?: cdn.PriceClass;
  /**
   * Origin request policy determines which parts of requests
   * CloudFront passes to your backend
   *
   * @default AllViewer managed policy
   * @link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/controlling-origin-requests.html
   */
  readonly originRequestPolicy?: cdn.IOriginRequestPolicy;

  /**
   * Cache policy determies caching for dynamic content.
   *
   * Note: static content is cached using default setting (CACHING_OPTIMIZED).
   *
   * @default CACHING_DISABLED
   * @link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/controlling-origin-requests.html
   */
  readonly cachePolicy?: cdn.ICachePolicy;

  /**
   * Bucket props for the svelteStaticBucket s3 bucket.
   *
   * @link https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-s3.BucketProps.html
   */
  readonly bucketProps?: s3.BucketProps;

  /**
   * Certificate to use with the CloudFront Distribution
   *
   * @default undefined
   */
  readonly certificateArn?: string;

  /**
   * Domain names to associate with the CloudFront Distribution
   *
   * @default undefined
   */
  readonly domainNames?: Array<string>;
}

export class SvelteDistribution extends Construct {
  distribution: cdn.Distribution;
  bucket: s3.Bucket;
  function?: cdn.experimental.EdgeFunction;
  constructor(scope: Construct, id: string, props: SvelteDistributionProps) {
    super(scope, id);

    // validate pros and apply defaults
    checkProps(props);
    const artifactPath = props.artifactPath || DEFAULT_ARTIFACT_PATH;
    const artifact = new SvelteKitCDKArtifact(artifactPath);
    artifact.read();
    const envUtils = new EnvUtil(props.rendererProps?.environment || {});


    // origins
    const bucketProps = props.bucketProps || {};
    this.bucket = new s3.Bucket(this, 'svelteStaticBucket', bucketProps);

    const s3origin = new cdnOrigins.S3Origin(this.bucket, {
      originPath: 'static',
    });

    // cache and origin request policies
    const originRequestPolicy = props.originRequestPolicy || cdn.OriginRequestPolicy.ALL_VIEWER;
    const cachePolicy = props.cachePolicy || new cdn.CachePolicy(this, 'svelteDynamicCachePolicy', {
      cookieBehavior: cdn.CacheCookieBehavior.all(),
    });

    writeFileSync(
      join(artifact.lambdaPath, 'settings.js'),
      [
        `export const logLevel = ${JSON.stringify(props.rendererProps?.logLevel || 'INFO')};`,
        `export const headerEnvMap = ${envUtils.mappingJSON()};`,
      ].join('\n'),
    );

    this.function = new cdn.experimental.EdgeFunction(this, 'svelteHandler', {
      code: lambda.Code.fromAsset(artifact.lambdaPath),
      handler: 'at-edge-handler.handler',
      runtime: lambda.Runtime.NODEJS_16_X,
      timeout: Duration.seconds(5),
      memorySize: 512,
      logRetention: 7,
    });

    const edgeLambdas = [{
      eventType: cdn.LambdaEdgeEventType.ORIGIN_REQUEST,
      functionVersion: this.function.currentVersion,
      includeBody: true,
    }];

    // distribution
    this.distribution = new cdn.Distribution(this, 'distro', {
      priceClass: props.priceClass || cdn.PriceClass.PRICE_CLASS_100,
      defaultBehavior: {
        origin: s3origin,
        viewerProtocolPolicy: cdn.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        edgeLambdas,
        allowedMethods: cdn.AllowedMethods.ALLOW_ALL,
        originRequestPolicy,
        cachePolicy,
      },
      domainNames: props.domainNames ? props.domainNames : undefined,
      certificate: props.certificateArn ? Certificate.fromCertificateArn(this, 'domainCert', props.certificateArn) : undefined,
    });

    // routes for static content
    artifact.staticGlobs.forEach((glob) => {
      this.distribution.addBehavior(glob, s3origin, {
        viewerProtocolPolicy: cdn.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      });
    });

    new BucketDeployment(this, 'svelteStaticDeployment', {
      destinationBucket: this.bucket,
      destinationKeyPrefix: 'static',
      sources: [Source.asset(artifact.staticPath)],
      distribution: this.distribution,
      cacheControl: [
        CacheControl.maxAge(Duration.days(365)),
      ],
      distributionPaths: getDistributionPaths(artifact),
    });
  }
}

function checkProps(props: SvelteDistributionProps) {
  if (props.certificateArn && !props.domainNames) {
    throw new Error('domainNames must be provided when setting a certificateArn');
  }
}

/**
 * Prepare structures for passing env vars into Lambda@Edge
 */
class EnvUtil {
  values: Record<string, string>;
  headers: Record<string, string>;

  constructor(env: Record<string, string>) {
    this.values = env;
    this.headers = Object.fromEntries(
      Object.keys(env).map(k => [k, `x-env-${randomBytes(9).toString('hex')}`]),
    );
  }

  mappingJSON = () => {
    return JSON.stringify(Object.fromEntries(
      Object.entries(this.headers).map(([k, v]) => ([v, k]))));
  };

  customHeaders = () => {
    return Object.fromEntries(Object.entries(this.values).map(([k, v]) => (
      [this.headers[k], v]
    )));
  };
}

function getDistributionPaths(artifact: SvelteKitCDKArtifact): string[] {
  return artifact.prerenderedRoutes.concat(artifact.staticGlobs).map(p => {
    if (p.startsWith('/')) {
      return p;
    } else {
      return `/${p}`;
    };
  });
}

