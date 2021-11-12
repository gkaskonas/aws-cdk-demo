import { Construct,  Stack, StackProps } from '@aws-cdk/core';
import { CodePipeline, CodePipelineSource, ShellStep } from "@aws-cdk/pipelines";
import { PipelineStage } from './appStage';

/**
 * The stack that defines the application pipeline
 */
export class CdkPipelineStack extends Stack {
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
                    'npx cdk synth'
                ],
            }),
            crossAccountKeys: true
        });

        // This is where we add the application stages
        pipeline.addStage(new PipelineStage(this, 'PreProd', {
            env: { account: "404319983256", region: "eu-west-1" },
        }));
    }
}