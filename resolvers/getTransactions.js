import { docClient, promisify } from './setup';

const getTransactions = (handle, args) => {
  return promisify(callback => {
    const params = {
      TableName: 'Transactions',
      KeyConditionExpression: 'handle = :v1',
      ExpressionAttributeValues: {
        ':v1': handle,
      },
      IndexName: 'transaction-index'
    };

    docClient.query(params, callback);
  }).then(result => {
    const listOfTransactions = {
      items: [],
    };

    for (let item of result.Items) {
      listOfTransactions.items.push(item);
    }

    return listOfTransactions;
  });
};

export { getTransactions }