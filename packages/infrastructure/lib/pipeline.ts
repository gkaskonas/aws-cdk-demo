import { Construct } from "constructs";
import { BuildEnvironmentVariableType, ComputeType, LinuxBuildImage } from "aws-cdk-lib/aws-codebuild";
import { Stack, StackProps } from "aws-cdk-lib";
import {
  CodePipeline,
  CodePipelineSource,
  ManualApprovalStep,
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
    pipelineName: "portfolio-pipeline",

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
        environmentVariables: {
          REACT_APP_API_KEY: {
            type: BuildEnvironmentVariableType.PARAMETER_STORE,
            value: "CONTACT_FORM_API_KEY"
          }
        }
      },
    },
  });
}

export class WebsitePipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);


    // This is where we add the application stages

    const webDev = new WebsiteStage(this, "webDev", {
      env: {
        account: TargetAccounts.DEV,
        region: TargetRegions.EUROPE,
      },
    });

    const webProd = new WebsiteStage(this, "webProd", {
      env: {
        account: TargetAccounts.PROD,
        region: TargetRegions.EUROPE,
      },
    });

    const pipeline = getPipeline(this);


    pipeline.addStage(webDev);
    pipeline.addStage(webProd, {
      pre: [
        new ManualApprovalStep("PromoteToProd"),
      ],
    });
  }
}
