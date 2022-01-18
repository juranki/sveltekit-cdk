#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SimpleSvelteStack } from '../lib/sample-stack-v2-stack';

const app = new cdk.App();
new SimpleSvelteStack(app, 'SimpleSvelteStackV2', {
  env: { account: '385180606991', region: 'us-east-1' },
});