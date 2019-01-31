const schema = `
type Query {
    getUserInfo(handle: String!): User!
    getStockInfo(id: String!): Stock!
    getMarketInfo: [Stock]!
}

type Mutation {
    buy(
        handle: String!
        id: String!
        amount: Int!
    ): String!

    sell(
        handle: String!
        id: String!
        amount: Int!
    ): String!
}

type StockConnection {
    items: [Stock]!
}

type TransactionConnection {
    items: [Transaction]!
}

type User {
    id: ID
    handle: String!
    balance: Float!
    transactions: TransactionConnection
    stocks: StockConnection
}

type Transaction {
    handle: String!
    id: String!
    stock: Stock!
    amount: Int!
    type: String!
    created_at: String!
}

type Stock {
    id: String!
    price: Float!
}


schema {
    query: Query
    mutation: Mutation
}`;

// eslint-disable-next-line import/prefer-default-export
export { schema };
