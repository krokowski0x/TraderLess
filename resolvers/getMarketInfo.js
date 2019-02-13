import * as fetch from 'node-fetch';
import { docClient, promisify } from './setup';

const getMarketInfo = async () => {
    const response = await fetch('https://pkgstore.datahub.io/core/s-and-p-500-companies/constituents_json/data/64dd3e9582b936b0352fdd826ecd3c95/constituents_json.json')
    const result = await response.json();

    result.forEach(stock => {
        const params = {
            TableName: 'Stocks',
            Item: {
                id: stock.Symbol,
                name: stock.Name,
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
};

export { getMarketInfo }