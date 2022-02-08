#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SvelteKitTestStack } from '../lib/test-stack'

const app = new cdk.App();
new SvelteKitTestStack(app, 'SvelteKitTest', {
  env: { account: '385180606991', region: 'us-east-1' },
});