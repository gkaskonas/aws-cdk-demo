import { APIGatewayProxyEvent } from "aws-lambda"

import aws from 'aws-sdk'
import { SendEmailRequest } from "aws-sdk/clients/sesv2"
const ses = new aws.SESV2()
const myEmail = process.env.EMAIL
const myDomain = process.env.DOMAIN

function generateResponse (code: number, payload: any) {
  return {
    statusCode: code,
    headers: {
      'Access-Control-Allow-Origin': myDomain,
      'Access-Control-Allow-Headers': 'x-requested-with',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(payload)
  }
}

function generateError (code: number, err: any) {
  console.log(err)
  return {
    statusCode: code,
    headers: {
      'Access-Control-Allow-Origin': myDomain,
      'Access-Control-Allow-Headers': 'x-requested-with',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(err.message)
  }
}

function generateEmailParams (body: string): SendEmailRequest {
  const { email, name, content } = JSON.parse(body)
  console.log(email, name, content)
  if (!(email && name && content)) {
    throw new Error('Missing parameters! Make sure to add parameters \'email\', \'name\', \'content\'.')
  }

  if (!myEmail) throw new Error("Missing myEmail!")

  return {
    FromEmailAddress: myEmail,
    Destination: { ToAddresses: [myEmail] },
    ReplyToAddresses: [email],
    Content: {
      Simple: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: `Message sent from email ${email} by ${name} \nContent: ${content}`
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `You received a message from ${myDomain}!`
      }
    }
  }
  }
}

module.exports.send = async (event: APIGatewayProxyEvent) => {
  try {
    if (!event.body) throw new Error("No body!")
    const emailParams = generateEmailParams(event.body)
    const data = await ses.sendEmail(emailParams).promise()
    return generateResponse(200, data)
  } catch (err) {
    return generateError(500, err)
  }
}
