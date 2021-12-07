import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import {
  AttributeType,
  Table,
  TableEncryption,
} from "aws-cdk-lib/aws-dynamodb";
import {
  Cors,
  LambdaIntegration,
  LambdaRestApi,
} from "aws-cdk-lib/aws-apigateway";
import { RetentionDays } from "aws-cdk-lib/aws-logs";

/**
 * A stack for our simple Lambda-powered web service
 */
export class ApplicationStack extends Stack {
  /**
   * The URL of the API Gateway endpoint, for use in the integ tests
   */
  public readonly urlOutput: CfnOutput;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const table = new Table(this, "dynamo", {
      partitionKey: {
        name: "id",
        type: AttributeType.NUMBER,
      },
      readCapacity: 1,
      writeCapacity: 1,
      encryption: TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // The Lambda function that contains the functionality
    const handler = new Function(this, "Lambda", {
      runtime: Runtime.NODEJS_14_X,
      handler: "handler.handler",
      code: Code.fromAsset(path.resolve(__dirname, "lambda")),
      environment: {
        TABLE_ID: table.tableName,
      },
      logRetention: RetentionDays.TWO_WEEKS,
    });

    table.grantReadWriteData(handler);

    // An API Gateway to make the Lambda web-accessible
    const api = new LambdaRestApi(this, id, {
      restApiName: `webservice-api`,
      handler,
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: Cors.DEFAULT_HEADERS,
      },
      proxy: false,
    });

    const getBookIntegration = new LambdaIntegration(handler);

    const items = api.root.addResource("items");
    items.addMethod("GET", getBookIntegration); // GET /items
    items.addMethod("POST", getBookIntegration); // POST /items

    const item = items.addResource("{item}");
    item.addMethod("GET", getBookIntegration); // GET /items/{item}

    this.urlOutput = new CfnOutput(this, "Url", {
      value: api.url,
    });
  }
}
