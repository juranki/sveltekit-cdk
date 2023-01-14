import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Construct } from 'constructs';
import { SvelteDistribution } from '../src';

class TestStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    new SvelteDistribution(this, 'site', {
      artifactPath: 'test/artifact',
    });
  }
}

test('demo site', () => {
  const app = new App();
  const stack = new TestStack(app, 'TestStack', {
    env: { region: 'us-east-1' },
  });
  const template = Template.fromStack(stack);
  expect(template).toMatchSnapshot();
});