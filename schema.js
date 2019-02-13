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
    ): Transaction!

    sell(
        handle: String!
        id: String!
        amount: Int!
    ): Transaction!
}

type TransactionConnection {
    items: [Transaction]!
}

type User {
    id: ID
    handle: String!
    balance: Float!
    transactions: TransactionConnection
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
    name: String
    price: Float!
}

schema {
    query: Query
    mutation: Mutation
}`;

export { schema };
