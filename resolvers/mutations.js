import nanoid from 'nanoid';
import { docClient, promisify } from './setup';

const createTransaction = (args, type, operand) => {
  return promisify(callback => {
      const params = {
        TableName: 'Stocks',
        KeyConditionExpression: 'id = :v1',
        ExpressionAttributeValues: {
          ':v1': args.id,
        },
      };

      docClient.query(params, callback);
    })
    .then(result => {
      const timestamp = new Date();
      args.stock = result.Items[0];

      return promisify(callback => {
        const params = {
          TableName: 'Transactions',
          Item: {
            "id": nanoid(),
            "handle": args.handle,
            "stock": args.stock,
            "amount": args.amount,
            "type": type,
            "created_at": timestamp.toLocaleString(),
          }
        };

        docClient.put(params, callback);
      })
    })
    .then(() => {
      return promisify(callback =>
        docClient.update({
            TableName: 'Users',
            Key: {
              "handle": args.handle,
            },
            UpdateExpression: `set balance = balance ${operand} :b`,
            ExpressionAttributeValues: {
              ":b": args.amount * args.stock.price,
            },
          },
          callback
        )
      )
    })
    .then(() => args.stock);
};
const buy = args => createTransaction(args, "buy", "-");
const sell = args => createTransaction(args, "sell", "+");

export { buy, sell }