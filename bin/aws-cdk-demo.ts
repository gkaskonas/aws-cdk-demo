#!/usr/bin/env node
import { App } from '@aws-cdk/core';
import { CdkPipelineStack } from '../lib/pipeline';

const app = new App();

new CdkPipelineStack(app, 'CdkpipelinesDemoPipelineStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: "eu-west-1" },
});

app.synth();