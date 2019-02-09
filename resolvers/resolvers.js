import nanoid from 'nanoid';
import * as fetch from 'node-fetch';
import dynamodb from 'serverless-dynamodb-client';

let docClient;

if (process.env.NODE_ENV === 'production') {
  const AWSXRay = require('aws-xray-sdk');
  const AWS = AWSXRay.captureAWS(require('aws-sdk'));
  docClient = new AWS.DynamoDB.DocumentClient();
} else {
  docClient = dynamodb.doc;
}

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
    }).then(result => result.Items);
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
  async getStockInfo(args) {
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
  async getMarketInfo() {
    const response = await fetch('https://pkgstore.datahub.io/core/s-and-p-500-companies/constituents_json/data/64dd3e9582b936b0352fdd826ecd3c95/constituents_json.json')
    const result = await response.json();

    result.forEach(stock => {
      const params = {
        TableName: 'Stocks',
        Item: {
          id: stock.Symbol,
          price: 0,
        },
      };

      docClient.put(params, err => {
        if (err) {
          console.error(JSON.stringify(err, null, 2));
        }
      });
    });
    
    return promisify(callback => {
      const params = {
        TableName: 'Stocks',
      };

      docClient.scan(params, callback);
    }).then(result => result.Items);
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
      args.stock = result.Items[0];

      return promisify(callback => {
        const params = {
          TableName: 'Transactions',
          Item: {
            "id": nanoid(),
            "handle": args.handle,
            "stock": args.stock,
            "amount": args.amount,
            "type": "buy",
            "created_at": timestamp.toLocaleDateString(),
          }
        };
  
        docClient.put(params, callback);
    })})
    .then(() => {
      return promisify(callback =>
        docClient.update(
          {
            TableName: 'Users',
            Key:{
              "handle": args.handle,
            },
            UpdateExpression: "set balance = balance - :b",
            ExpressionAttributeValues:{
              ":b": args.amount * args.stock.price,
            },
          },
          callback
        )
      )
    })
    .then(() => "Done");
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
    .then(() => "Done");
  }
};

export const resolvers = {
  Query: {
    getUserInfo: (root, args) => data.getUserInfo(args),
    getStockInfo: (root, args) => data.getStockInfo(args),
    getMarketInfo: () => data.getMarketInfo(),
  },
  Mutation: {
    buy: (root, args) => data.buy(args),
    sell: (root, args) => data.sell(args),
  },
  User: {
    transactions: (obj, args) => data.getTransactions(obj.handle, args),
  },
};