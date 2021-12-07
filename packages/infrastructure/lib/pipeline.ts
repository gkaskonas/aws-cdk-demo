import { Construct } from "constructs";
import { ComputeType, LinuxBuildImage } from "aws-cdk-lib/aws-codebuild";
import { Stack, StackProps } from "aws-cdk-lib";
import { AppStage } from "./stages/appStage";
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from "aws-cdk-lib/pipelines";
import { WebsiteStage } from "./stages/websiteStage";
import { TargetAccounts, TargetRegions } from "./utils/environments";

/**
 * The stack that defines the application pipeline
 */

function getPipeline(scope: Stack): CodePipeline {
  return new CodePipeline(scope, "Pipeline", {
    // The pipeline name
    pipelineName: "aws-cdk-app",

    // How it will be built and synthesized
    synth: new ShellStep("Synth", {
      // Where the source can be found
      input: CodePipelineSource.connection("gkaskonas/aws-cdk-demo", "main", {
        connectionArn: `arn:aws:codestar-connections:${scope.region}:${scope.account}:connection/a4848827-92c7-4203-b816-81ec422b6c26`,
      }),

      // Install dependencies, build and run cdk synth
      commands: ["yarn install", "yarn build", "yarn cdk synth"],
      primaryOutputDirectory: "packages/infrastructure/cdk.out",
    }),
    crossAccountKeys: true,
    codeBuildDefaults: {
      buildEnvironment: {
        computeType: ComputeType.SMALL,
        buildImage: LinuxBuildImage.STANDARD_5_0,
      },
    },
  });
}
export class WebsitePipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = getPipeline(this);

    // This is where we add the application stages

    const appDev = new AppStage(this, "appDev", {
      env: {
        account: TargetAccounts.DEV,
        region: TargetRegions.EUROPE,
      },
    });

    const webDev = new WebsiteStage(this, "webDev", {
      env: {
        account: TargetAccounts.DEV,
        region: TargetRegions.EUROPE,
      },
    });

    pipeline.addStage(appDev, {
      // post: [
      //   new ShellStep("postDeploy", {
      //     commands: [
      //       // Use 'curl' to GET the given URL and fail if it returns an error
      //       "curl -Ssf $ENDPOINT_URL/items/1",
      //     ],
      //     envFromCfnOutputs: {
      //       // Get the stack Output from the Stage and make it available in
      //       // the shell script as $ENDPOINT_URL.
      //       ENDPOINT_URL: appDev.urlOutput,
      //     },
      //   }),
      // ],
    });

    pipeline.addStage(webDev, {
      // post: [
      //   new ShellStep("postDeploy", {
      //     commands: [
      //       // Use 'curl' to GET the given URL and fail if it returns an error
      //       "curl -Ssf $ENDPOINT_URL/items/1",
      //     ],
      //     envFromCfnOutputs: {
      //       // Get the stack Output from the Stage and make it available in
      //       // the shell script as $ENDPOINT_URL.
      //       ENDPOINT_URL: webDev.urlOutput,
      //     },
      //   }),
      // ],
    });
  }
}
