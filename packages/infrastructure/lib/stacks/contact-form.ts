import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import {
  Cors,
  LambdaIntegration,
  LambdaRestApi,
} from "aws-cdk-lib/aws-apigateway";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";

/**
 * A stack for our simple Lambda-powered web service
 */
export class ContactFormStack extends Stack {
  /**
   * The URL of the API Gateway endpoint, for use in the integ tests
   */
  public readonly urlOutput: CfnOutput;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // The Lambda function that contains the functionality
    const handler = new Function(this, "Lambda", {
      runtime: Runtime.NODEJS_14_X,
      handler: "handler.send",
      code: Code.fromAsset(path.resolve(__dirname, "../lambda/contact/")),
      environment: {
        EMAIL: "contact@peterkaskonas.com",
        DOMAIN: "peterkaskonas.com"
      },
      logRetention: RetentionDays.TWO_WEEKS,
      initialPolicy: [new PolicyStatement({
        actions: [
          'ses:SendRawEmail',
          'ses:SendEmail',
        ],
        resources: ['*'],
      })]
    });


    // An API Gateway to make the Lambda web-accessible
    const api = new LambdaRestApi(this, id, {
      restApiName: `contact-form-api`,
      handler,
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: Cors.DEFAULT_HEADERS,
      },
      proxy: false,
    });

    const contactFormIntegration = new LambdaIntegration(handler);

    const items = api.root.addResource("submit");
    items.addMethod("POST", contactFormIntegration); // POST /items

    this.urlOutput = new CfnOutput(this, "Url", {
      value: api.url,
    });
  }
}
