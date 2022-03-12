import { Stack, StackProps } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs';
import { SvelteDistribution } from '@sveltekit-cdk/constructsv2'

export class SvelteKitTestStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, 'dummyBucket')
    new SvelteDistribution(this, 'svelteDistribution', {
      rendererProps: {
        logLevel: 'DEBUG',
        environment: {
          TEST_ENV_VAR: 'test value',
          BUCKET_NAME: bucket.bucketName,
        },
      }
    })
  }
}