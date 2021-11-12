import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { DynamoDB } from "aws-sdk"

let statusCode = 200;
const headers = {
    "Content-Type": "application/json"
};
export async function handler(event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> {

    console.log(event)


    const dynamoClient = new DynamoDB.DocumentClient()

    const tableName = process.env.TABLE_ID ?? "default"

    let body;

    if (!event.pathParameters) throw new Error("No path")

    console.log(event.pathParameters.items)

    switch (event.httpMethod) {
        case "GET":
            body = await dynamoClient.get({
                TableName: tableName,
                Key: {
                    id: event.pathParameters.items
                }
            }).promise()

            const response = JSON.stringify(body)
        case "PUT /items":
            if (!event.body) throw new Error("No body!")
            let requestJSON = JSON.parse(event.body);
            await dynamoClient
                .put({
                    TableName: "http-crud-tutorial-items",
                    Item: {
                        id: requestJSON.id,
                        price: requestJSON.price,
                        name: requestJSON.name
                    }
                })
                .promise();
            body = `Put item ${requestJSON.id}`;
            break;
        default:
            throw new Error(`Unsupported route:"`);
    }

    return {
        statusCode,
        body,
        headers
    };
}