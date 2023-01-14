import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Construct } from 'constructs';
import { SvelteDistribution } from '../src';

class TestStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    new SvelteDistribution(this, 'site', {});
  }
}

test('i have a site', () => {
  const f = () => {
    const app = new App();
    const stack = new TestStack(app, 'TestStack');
    Template.fromStack(stack);
  };
  expect(f).toThrowError("ENOENT: no such file or directory, open 'sveltekit/meta.json'");
});