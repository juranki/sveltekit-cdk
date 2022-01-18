import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SvelteDistribution } from '@sveltekit-cdk/constructsv2'
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class SimpleSvelteStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new SvelteDistribution(this, 'svelteDistribution', {
      renderer: {
        type: 'VIEWER_REQ',
        rendererProps: {
          environment: {
            LOG_LEVEL: 'DEBUG',
          },
        }
      }
    })

  }
}