import * as fetch from 'node-fetch';
import { docClient, promisify } from './setup';

const getStockInfo = async (args) => {
  const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${args.id}&apikey=${process.env.API_KEY}`);
  const result = await response.json();
  const stockPrice = await Number(result['Global Quote']['05. price']);
  const Userparams = {
    TableName: 'Stocks',
    Item: {
      id: args.id,
      price: stockPrice,
    },
  };

  docClient.put(Userparams, err => {
    if (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  });
  return promisify(callback =>
    docClient.query({
        TableName: 'Stocks',
        KeyConditionExpression: 'id = :v1',
        ExpressionAttributeValues: {
          ':v1': args.id,
        },
      },
      callback
    )
  ).then(result => result.Items[0]);
};

export { getStockInfo }