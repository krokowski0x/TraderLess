import dynamodb from 'serverless-dynamodb-client';

let docClient;

if (process.env.NODE_ENV === 'production') {
  const AWSXRay = require('aws-xray-sdk');
  const AWS = AWSXRay.captureAWS(require('aws-sdk'));
  docClient = new AWS.DynamoDB.DocumentClient();
} else {
  docClient = dynamodb.doc;
}

export { docClient }