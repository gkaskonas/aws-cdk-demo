import { ComputeType, LinuxBuildImage } from '@aws-cdk/aws-codebuild';
import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { CodePipeline, CodePipelineSource, ShellStep } from "@aws-cdk/pipelines";
import { AppStage } from './appStage';
import { Website } from './websiteStage';

/**
 * The stack that defines the application pipeline
 */
export class WebsitePipelineStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const pipeline = new CodePipeline(this, 'Pipeline', {
            // The pipeline name
            pipelineName: 'aws-cdk-app',

            // How it will be built and synthesized
            synth: new ShellStep('Synth', {
                // Where the source can be found
                input: CodePipelineSource.connection('gkaskonas/aws-cdk-demo', 'main', {
                    connectionArn: "arn:aws:codestar-connections:eu-west-1:269065460843:connection/a4848827-92c7-4203-b816-81ec422b6c26"
                }),

                // Install dependencies, build and run cdk synth
                commands: [
                    'npm ci',
                    'npm run build',
                    'cd nextjs-blog && npm run build',
                    'npx cdk synth'
                ],
            }),
            crossAccountKeys: true,
            codeBuildDefaults: {
                buildEnvironment: {
                    computeType: ComputeType.SMALL,
                    buildImage: LinuxBuildImage.STANDARD_5_0
                }
            }

        });

        // This is where we add the application stages

         new Website(this, 'websiteDev', {
            env: { account: "404319983256", region: "eu-west-1" },
        })

        const appDev = new AppStage(this, 'dev', {
            env: { account: "404319983256", region: "eu-west-1" },
        })
        pipeline.addStage(appDev, {
            post: [
                new ShellStep('TestService', {
                    commands: [
                        // Use 'curl' to GET the given URL and fail if it returns an error
                        'curl -Ssf $ENDPOINT_URL/items/1',
                    ],
                    envFromCfnOutputs: {
                        // Get the stack Output from the Stage and make it available in
                        // the shell script as $ENDPOINT_URL.
                        ENDPOINT_URL: appDev.urlOutput,
                    },
                }),

            ]
        });
    }
}