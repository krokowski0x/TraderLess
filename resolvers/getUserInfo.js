import { docClient } from './setup';

const getUserInfo = async (args) => {
  const params = {
    TableName: 'Users',
    KeyConditionExpression: 'handle = :v1',
    ExpressionAttributeValues: {
      ':v1': args.handle,
    },
  };
  const result = await docClient.query(params).promise();

  return result.Items[0];
};

export { getUserInfo }