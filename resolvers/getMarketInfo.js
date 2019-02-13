import * as fetch from 'node-fetch';
import { docClient } from './setup';

const getMarketInfo = async () => {
	const stockListURL = 'https://pkgstore.datahub.io/core/s-and-p-500-companies/constituents_json/data/64dd3e9582b936b0352fdd826ecd3c95/constituents_json.json'
	const response = await fetch(stockListURL);
	const result = await response.json();

	result.forEach(async stock => {
		const params = {
			TableName: 'Stocks',
			Item: {
				id: stock.Symbol,
				name: stock.Name,
				price: 0,
			},
		};

		await docClient.put(params).promise();
	});

	const params = {
		TableName: 'Stocks',
	};
	const stocks = await docClient.scan(params).promise();

	return stocks.Items;
};

export { getMarketInfo }