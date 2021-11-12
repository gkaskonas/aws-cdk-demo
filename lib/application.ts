import * as apigw from '@aws-cdk/aws-apigateway';
import * as lambda from '@aws-cdk/aws-lambda';
import { CfnOutput, Construct, Duration, Stack, StackProps } from '@aws-cdk/core';
import * as path from 'path';
import { AttributeType, Table } from "@aws-cdk/aws-dynamodb"
import { Cors } from '@aws-cdk/aws-apigateway';
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
        type: AttributeType.NUMBER
      },
      readCapacity: 1,
      writeCapacity: 1
    })

    // The Lambda function that contains the functionality
    const handler = new lambda.Function(this, 'Lambda', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'handler.handler',
      code: lambda.Code.fromAsset(path.resolve(__dirname, 'lambda')),
      environment: {
        TABLE_ID: table.tableName
      }
    });

    table.grantReadWriteData(handler)

    // An API Gateway to make the Lambda web-accessible
    const api = new apigw.LambdaRestApi(this, id, {
      restApiName: `${this.toString()}-api`,
      handler,
      deployOptions: {
        cachingEnabled: true,
        cacheTtl: Duration.hours(1),
        cacheClusterEnabled: true,
        cacheClusterSize: "0.5",
      },
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: Cors.DEFAULT_HEADERS,
      },
    });

    const getBookIntegration = new apigw.LambdaIntegration(handler, {
      proxy: false
    });

    const items = api.root.addResource('items');
    const getItems = items.addMethod('GET', getBookIntegration);  // GET /items
    items.addMethod('POST', getBookIntegration); // POST /items

    const item = items.addResource('{item}');
    item.addMethod('GET');   // GET /items/{item}

    this.urlOutput = new CfnOutput(this, 'Url', {
      value: api.url,
    });
  }
}