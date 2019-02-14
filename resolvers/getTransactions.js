import { docClient } from './setup';

const getTransactions = async (handle, args) => {
  const transactionQueryParams = {
    TableName: 'Transactions',
    KeyConditionExpression: 'handle = :v1',
    ExpressionAttributeValues: {
      ':v1': handle,
    },
    IndexName: 'transaction-index'
  };
  const result = await docClient.query(transactionQueryParams).promise();
  const listOfTransactions = {
    items: [],
  };

  for (let item of result.Items) {
    listOfTransactions.items.push(item);
  }

  return listOfTransactions;
};

export { getTransactions }