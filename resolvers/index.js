import { getMarketInfo } from './getMarketInfo';
import { getStockInfo } from './getStockInfo';
import { getUserInfo } from './getUserInfo';
import { getTransactions } from './getTransactions';
import { buy, sell } from './mutations';

export const resolvers = {
  Query: {
    getUserInfo: (root, args) => getUserInfo(args),
    getStockInfo: (root, args) => getStockInfo(args),
    getMarketInfo: () => getMarketInfo(),
  },
  Mutation: {
    buy: (root, args) => buy(args),
    sell: (root, args) => sell(args),
  },
  User: {
    transactions: (obj, args) => getTransactions(obj.handle, args),
  },
};