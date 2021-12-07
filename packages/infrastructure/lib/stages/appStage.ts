import { CfnOutput, Stage, StageProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { ApplicationStack } from "../stacks/application";

/**
 * Deployable unit of web service app
 */
export class AppStage extends Stage {
  public readonly urlOutput: CfnOutput;

  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    const service = new ApplicationStack(this, "WebService");

    // Expose CdkpipelinesDemoStack's output one level higher
    this.urlOutput = service.urlOutput;
  }
}
