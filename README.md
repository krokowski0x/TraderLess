# Traderless

Simple stock exchange simulator, built with GraphQL, Serverless Framework, AWS Lambda and DynamoDB.

## Brief description

This app, in its current form, lets you check stock prices of S&P500 companies and simulate buying or selling them, with your initial account balance of 100.000$.
There is a Medium article comming up shortly, about how to build such an app and all of the theory behind different technologies used in here.

## Available queries

* Geting user info (balance, transactions etc.)
* Getting market info (all the S&P500 companies' codes)
* Getting stock info (current price of the chosen stock)

## Available mutations

* Buying certain amount of chosen stock
* Selling certain amount of chosen stock

## Built with

* [This amazing boilerplate](https://github.com/serverless/serverless-graphql) - simple GraphQL/Serverless Framework/DynamoDB boilerplate
* [Serverless Framework](https://serverless.com/) - a great thing, if you don't want to get your hands dirty with DevOps
* [GraphQL](https://graphql.org/) - a great thing if you don't want to provide hunderds of REST API endpoints
* [Apollo Server](https://www.apollographql.com/docs/apollo-server/servers/lambda.html) - a great thing, if you don't really know GraphQL, but want to use it
* [AWS Lambda](https://aws.amazon.com/lambda/) - a great thing, if you don't have a supercomputer in your backyard, but want to deploy some apps
* [DynamoDB](https://aws.amazon.com/dynamodb/) - a great thing, if you want to have some data, but you don't like SQL