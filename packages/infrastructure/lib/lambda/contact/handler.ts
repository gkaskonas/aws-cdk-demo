import {APIGatewayProxyEventV2, APIGatewayProxyResultV2} from 'aws-lambda';
import AWS from 'aws-sdk';
import { SendEmailRequest } from 'aws-sdk/clients/ses';

export type ContactDetails = {
  name: string;
  email: string;
  message: string;
};

const DOMAIN  = process.env.DOMAIN 

export async function main(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {
  try {
    if (!event.body)
      throw new Error('Properties name, email and message are required.');

    const {name, email, message} = JSON.parse(event.body) as ContactDetails;
    if (!name || !email || !message)
      throw new Error('Properties name, email and message are required');

    return await sendEmail({name, email, message});
  } catch (error: unknown) {
    console.log('ERROR is: ', error);
    if (error instanceof Error) {
      return JSON.stringify({body: {error: error.message}, statusCode: 400});
    }
    return JSON.stringify({
      body: {error: JSON.stringify(error)},
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': DOMAIN,
        'Access-Control-Allow-Headers': 'x-requested-with',
        'Access-Control-Allow-Credentials': true
      },
    });
  }
}

async function sendEmail({
  name,
  email,
  message,
}: ContactDetails): Promise<APIGatewayProxyResultV2> {
  const SES_REGION  = process.env.SES_REGION 
  if (!SES_REGION) {
    throw new Error(
      'Please add the SES_REGION Environment Variable',
    );
  }
  const ses = new AWS.SES({region: SES_REGION});
  await ses.sendEmail(sendEmailParams({name, email, message})).promise();

  return JSON.stringify({
    body: {message: 'Email sent successfully 🎉🎉🎉'},
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': DOMAIN,
      'Access-Control-Allow-Headers': 'x-requested-with',
      'Access-Control-Allow-Credentials': true
    },
  });
}

function sendEmailParams({name, email, message}: ContactDetails): SendEmailRequest {
  const EMAIL  = process.env.EMAIL 
  if (!EMAIL) {
    throw new Error(
      'Please add Email env variable',
    );
  }
  return {
    ReplyToAddresses: [email],
    Destination: {
      ToAddresses: [EMAIL],
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: getHtmlContent({name, email, message}),
        },
        Text: {
          Charset: 'UTF-8',
          Data: getTextContent({name, email, message}),
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `Contact from personal website.`,
      },
    },
    Source: EMAIL,
  };
}

function getHtmlContent({name, email, message}: ContactDetails) {
  return `
    <html>
      <body>
        <h1>Received an Email. 📬</h1>
        <h2>Sent from: </h2>
        <ul>
          <li style="font-size:18px">👤 <b>${name}</b></li>
          <li style="font-size:18px">✉️ <b>${email}</b></li>
        </ul>
        <p style="font-size:18px">${message}</p>
      </body>
    </html> 
  `;
}

function getTextContent({name, email, message}: ContactDetails) {
  return `
    Received an Email. 📬
    Sent from:
        👤 ${name}
        ✉️ ${email}
    ${message}
  `;
}