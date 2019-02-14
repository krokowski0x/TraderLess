import * as fetch from 'node-fetch';
import { docClient } from './setup';

const getMarketInfo = async () => {
	const stockListURL = 'https://pkgstore.datahub.io/core/s-and-p-500-companies/constituents_json/data/64dd3e9582b936b0352fdd826ecd3c95/constituents_json.json'
	const response = await fetch(stockListURL);
	const stockList = await response.json();

	stockList.forEach(async stock => {
		const stockPutParams = {
			TableName: 'Stocks',
			Item: {
				id: stock.Symbol,
				name: stock.Name,
				price: 0,
			},
		};

		await docClient.put(stockPutParams).promise();
	});

	const stockScanParams = {
		TableName: 'Stocks',
	};
	const stocks = await docClient.scan(stockScanParams).promise();

	return stocks.Items;
};

export { getMarketInfo }