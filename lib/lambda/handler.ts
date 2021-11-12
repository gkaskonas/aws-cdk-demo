import { APIGatewayEvent, APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { DynamoDB } from "aws-sdk"

let statusCode = 200;
const headers = {
    "Content-Type": "application/json"
};
export async function handler(event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> {

    const dynamoClient = new DynamoDB.DocumentClient()

    const tableName = process.env.TABLE_ID ?? "default"

    if (!event.pathParameters) throw new Error("No path")

    const body = await dynamoClient.get({
        TableName: tableName,
        Key: {
            id: event.pathParameters.id
        }
    }).promise()

    const response = JSON.stringify(body)


    return {
        statusCode,
        body: response,
        headers
    };
}