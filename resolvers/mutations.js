import nanoid from 'nanoid';
import { docClient } from './setup';

const createTransaction = async (args, type, operand) => {
  const stockQueryParams = {
    TableName: 'Stocks',
    KeyConditionExpression: 'id = :v1',
    ExpressionAttributeValues: {
      ':v1': args.id,
    },
  };
  let stock = await docClient.query(stockQueryParams).promise();
  stock = stock.Items[0];

  const transactionPutParams = {
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
  await docClient.put(transactionPutParams).promise();

  const userUpdateParams = {
    TableName: 'Users',
    Key: {
      "handle": args.handle,
    },
    UpdateExpression: `set balance = balance ${operand} :b`,
    ExpressionAttributeValues: {
      ":b": args.amount * stock.price,
    },
  };
  await docClient.update(userUpdateParams).promise();

  return transactionPutParams.Item;
};

const buy = args => createTransaction(args, "buy", "-");
const sell = args => createTransaction(args, "sell", "+");

export { buy, sell }