import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SvelteDistribution } from '@sveltekit-cdk/constructsv2'

export class SimpleSvelteStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new SvelteDistribution(this, 'svelteDistribution', {
      rendererProps: {
        logLevel: 'DEBUG',
      }
    })
  }
}