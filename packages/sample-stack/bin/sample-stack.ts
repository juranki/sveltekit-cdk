#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {SimpleSvelteStack} from '@sveltekit-cdk/constructs'

const app = new cdk.App();
new SimpleSvelteStack(app, 'SimpleSvelteStack', {
  env: { account: '385180606991', region: 'us-east-1' },
});
