import * as fetch from 'node-fetch';
import { docClient } from './setup';

const getStockInfo = async (args) => {
  const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${args.id}&apikey=${process.env.API_KEY}`);
  const result = await response.json();
  const stockPrice = await Number(result['Global Quote']['05. price']);
  const stockPutParams = {
    TableName: 'Stocks',
    Item: {
      id: args.id,
      price: stockPrice,
    },
  };
  const stockQueryParams = {
    TableName: 'Stocks',
    KeyConditionExpression: 'id = :v1',
    ExpressionAttributeValues: {
      ':v1': args.id,
    },
  };

  await docClient.put(stockPutParams).promise();
  const stock = await docClient.query(stockQueryParams).promise();

  return stock.Items[0]
};

export { getStockInfo }