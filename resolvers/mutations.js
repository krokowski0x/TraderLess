import nanoid from 'nanoid';
import { docClient } from './setup';

const createTransaction = async (args, type, operand) => {
  const params1 = {
    TableName: 'Stocks',
    KeyConditionExpression: 'id = :v1',
    ExpressionAttributeValues: {
      ':v1': args.id,
    },
  };
  let stock = await docClient.query(params1).promise();
  stock = stock.Items[0];

  const params2 = {
    TableName: 'Transactions',
    Item: {
      "id": nanoid(),
      "handle": args.handle,
      "stock": stock,
      "amount": args.amount,
      "type": type,
      "created_at": new Date().toLocaleString(),
    }
  };
  const transaction = await docClient.put(params2).promise();

  const params3 = {
    TableName: 'Users',
    Key: {
      "handle": args.handle,
    },
    UpdateExpression: `set balance = balance ${operand} :b`,
    ExpressionAttributeValues: {
      ":b": args.amount * stock.price,
    },
  };
  await docClient.update(params3).promise();

  return params2.Item;
};

const buy = args => createTransaction(args, "buy", "-");
const sell = args => createTransaction(args, "sell", "+");

export { buy, sell }