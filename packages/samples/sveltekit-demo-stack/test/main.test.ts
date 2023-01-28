import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { SvelteKitDemoStack } from '../src/main';

test('Snapshot', () => {
  const app = new App();
  const stack = new SvelteKitDemoStack(app, 'test', {
    env: { region: 'us-east-1' },
  });

  const template = Template.fromStack(stack);

  expect(template.toJSON()).toMatchSnapshot();
});
