import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { DynamoDB } from "aws-sdk"

let statusCode = 200;
const headers = {
    "Content-Type": "application/json"
};
export async function handler(event: APIGatewayEvent, _context: Context): Promise<APIGatewayProxyResult> {

    console.log(event)


    const dynamoClient = new DynamoDB.DocumentClient()

    const tableName = process.env.TABLE_ID ?? "default"

    let body;

    switch (event.httpMethod) {
        case "GET":
            if (event.resource == "/items") {
                body = await dynamoClient.scan({
                    TableName: tableName
                }).promise()

                body = JSON.stringify(body.Items);
                break;
            }

            if (!event.pathParameters) throw new Error("No path")
            if (!event.pathParameters.item) throw new Error("No path")

            console.log(event.pathParameters.item)
            body = await dynamoClient.get({
                TableName: tableName,
                Key: {
                    id: parseInt(event.pathParameters.item)
                }
            }).promise()

            body = JSON.stringify(body);
            break;
        case "POST":
            if (!event.body) throw new Error("No body!")
            let requestJSON = JSON.parse(event.body);
            await dynamoClient
                .put({
                    TableName: tableName,
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