#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SimpleSvelteStack } from '../lib/sample-stack-v2-stack';

const app = new cdk.App();
new SimpleSvelteStack(app, 'SimpleSvelteStackV2', {
  env: {
    account: '480363651371', 
    // when region is not us-east-1 cdk automatically creates
    // a separate stack that deploys edge function to us-east-1
    region: 'eu-central-1'
  },
  zoneName: 'prudent-profile.com',
  fqdn: 'sveltekit-demo.prudent-profile.com'
});