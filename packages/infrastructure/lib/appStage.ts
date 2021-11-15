import { CfnOutput, Construct, Stage, StageProps } from '@aws-cdk/core';
import { ApplicationStack } from "./application"
import { WebsiteStack } from './website';
import { Builder } from "@sls-next/lambda-at-edge";

/**
 * Deployable unit of web service app
 */
export class AppStage extends Stage {
  public readonly urlOutput: CfnOutput;

  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    const service = new ApplicationStack(this, 'WebService');
    
    const builder = new Builder("../application/", "./build", { args: ["build"] });
    builder
  .build()
  .then(() => {
    new WebsiteStack(this, "website");
  })
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });


    // Expose CdkpipelinesDemoStack's output one level higher
    this.urlOutput = service.urlOutput;


  }
}