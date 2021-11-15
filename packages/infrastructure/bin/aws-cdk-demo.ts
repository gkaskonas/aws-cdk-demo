#!/usr/bin/env node
import { App } from '@aws-cdk/core';
import { WebsitePipelineStack } from '../lib/pipeline';

const app = new App();

new WebsitePipelineStack(app, 'nextjsWebsitePipeline', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: "eu-west-1" },
});

app.synth();