import { docClient, promisify } from './setup';

const getUserInfo = (args) => {
  return promisify(callback =>
    docClient.query({
        TableName: 'Users',
        KeyConditionExpression: 'handle = :v1',
        ExpressionAttributeValues: {
          ':v1': args.handle,
        },
      },
      callback
    )
  ).then(result => result.Items[0]);
};

export { getUserInfo }