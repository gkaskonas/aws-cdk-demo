import { Runtime } from '@aws-cdk/aws-lambda';
import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { NextJSLambdaEdge } from "@sls-next/cdk-construct";

export class WebsiteStack extends Stack {

  constructor(scope: Construct, id: string, props?: StackProps) {
    
    super(scope, id, props);
    new NextJSLambdaEdge(this, "NextJsApp", {
      serverlessBuildOutDir: "./build",
      runtime: Runtime.NODEJS_14_X
    });

  }
}