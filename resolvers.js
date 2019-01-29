
// add to handler.js
import dynamodb from 'serverless-dynamodb-client';

let docClient;

if (process.env.NODE_ENV === 'production') {
  const AWSXRay = require('aws-xray-sdk'); // eslint-disable-line global-require
  const AWS = AWSXRay.captureAWS(require('aws-sdk')); // eslint-disable-line global-require
  docClient = new AWS.DynamoDB.DocumentClient();
} else {
  docClient = dynamodb.doc;
}

// add to handler.js
const promisify = foo =>
  new Promise((resolve, reject) => {
    foo((error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

const data = {
  getTransactions(handle, args) {
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

      for (let i = 0; i < result.Items.length; i += 1) {
        listOfTransactions.items.push(result.Items[i]);
      }

      return listOfTransactions;
    });
  },
  getUserInfo(args) {
    return promisify(callback =>
      docClient.query(
        {
          TableName: 'Users',
          KeyConditionExpression: 'handle = :v1',
          ExpressionAttributeValues: {
            ':v1': args.handle,
          },
        },
        callback
      )
    ).then(result => result.Items[0]);
  },
  getStockInfo(args) {
    return promisify(callback =>
      docClient.query(
        {
          TableName: 'Stocks',
          KeyConditionExpression: 'id = :v1',
          ExpressionAttributeValues: {
            ':v1': args.id,
          },
        },
        callback
      )
    ).then(result => result.Items[0]);
  },
  getUserInfo(args) {
    return promisify(callback =>
      docClient.query(
        {
          TableName: 'Stocks',
          KeyConditionExpression: 'handle = :v1',
          ExpressionAttributeValues: {
            ':v1': args.handle,
          },
        },
        callback
      )
    ).then(result => result.Items[0]);
  },
  buy(args) {
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

      return promisify(callback => {
        const params = {
          TableName: 'Transactions',
          Item: {
            "id": "3",
            "handle": args.handle,
            "stock": result.Items[0],
            "amount": args.amount,
            "type": "buy",
            "created_at": timestamp.toLocaleDateString,
          }
        };
  
        docClient.put(params, callback);
    })})
    .then(result => {
      console.log("transaction:", result)
      return promisify(callback =>
        docClient.update(
          {
            TableName: 'Users',
            Key:{
              "handle": args.handle,
            },
            UpdateExpression: "set balance = balance - :b",
            ExpressionAttributeValues:{
              ":b": args.amount * 5,
            },
          },
          callback
        )
      )
    })
    .then(result => "Done");
  },
  sell(args) {
    return promisify(callback => {
      const params = {
        TableName: 'Stocks',
        KeyConditionExpression: 'id = :v1',
        ExpressionAttributeValues: {
          ':v1': args.id,
        },
      };

      docClient.query(params, callback);
    }).then(result => {
      return promisify(callback =>
        docClient.update(
          {
            TableName: 'Users',
            Key:{
              "handle": args.handle,
            },
            UpdateExpression: "set balance = balance + :b",
            ExpressionAttributeValues:{
              ":b": args.amount * result.Items[0].price,
            },
          },
          callback
        )
      )
    })
    .then(result => "Done");
  }
};

export const resolvers = {
  Query: {
    getUserInfo: (root, args) => data.getUserInfo(args),
    getStockInfo: (root, args) => data.getStockInfo(args),
  },
  Mutation: {
    buy: (root, args) => data.buy(args),
    sell: (root, args) => data.sell(args),
  },
  User: {
    transactions: (obj, args) => data.getTransactions(obj.handle, args),
  },
};