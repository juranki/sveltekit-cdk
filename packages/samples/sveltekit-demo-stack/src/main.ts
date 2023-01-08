import { SvelteDistribution } from '@sveltekit-cdk/constructs';
import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class SvelteKitDemoStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    //@ts-ignore
    new SvelteDistribution(this, 'site', {
      artifactPath: '../../../sveltekit-demo-artifact',
    });
    // define resources here...
  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new SvelteKitDemoStack(app, 'sveltekit-demo-stack', { env: devEnv });
// new MyStack(app, 'sveltekit-demo-stack-prod', { env: prodEnv });

app.synth();