import { CfnOutput, Construct, Stage, StageProps } from '@aws-cdk/core';
import { ApplicationStack } from "./application"
import { WebsiteStack } from './website';

/**
 * Deployable unit of web service app
 */
export class AppStage extends Stage {
  public readonly urlOutput: CfnOutput;

  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    const service = new ApplicationStack(this, 'WebService');
    new WebsiteStack(this, 'website');


    // Expose CdkpipelinesDemoStack's output one level higher
    this.urlOutput = service.urlOutput;


  }
}