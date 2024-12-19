// server.js
require('dotenv').config();

const { expressMiddleware } = require('@apollo/server/express4');
const bodyParser = require('body-parser');


const cors = require('cors');
const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const db = require('./db');
const models = require('./models');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const depthLimit = require('graphql-depth-limit')
const {createComplexityLimitRule} = require('graphql-validation-complexity')

const PORT = process.env.PORT || 4001;
const DB_HOST = process.env.DB_HOST || "mongodb://localhost:27017";
const typeDefs = require('./schema');

/*
let notes = [
    {id: '1', content: 'Hello world!', author: 'John Doe'},
    {id: '2', content: ' world!', author: 'Jon Doe'},
    {id: '3', content: 'Hello !', author: 'John De'},
]
*/

// Define resolvers
const resolvers = require('./resolvers');
const {ApolloServerPluginLandingPageGraphQLPlayground} = require("@apollo/server-plugin-landing-page-graphql-playground");

const app = express();
app.use(
    helmet({
        contentSecurityPolicy: false, // Allow external assets
    })
);

app.use(cors());


const getUser = token => {
    if (token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            throw new Error('Session invalid');
        }
    }
}


// Initialize Apollo Server
async function startApolloServer() {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        validationRules: [depthLimit(5), createComplexityLimitRule(1000)],

        context: ({req}) => {
            const token = req.headers.authorization;

            const user = getUser(token);
            return {models, user};
        },introspection: true,

    });
    await server.start(); // Required for Apollo Server v3+
    server.applyMiddleware({ app, path: '/api' });

    app.get('/', (req, res) => {
        res.send('Hello World!!!');
    });

    app.listen(PORT, () => {
        console.log(`GraphQL Server running at http://localhost:${PORT}${server.graphqlPath}`);
    });
}

startApolloServer();
db.init(DB_HOST);
