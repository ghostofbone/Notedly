const { gql } = require('apollo-server-express');

module.exports = gql`
    scalar DateTime
    type Note {
        id: ID!
        content: String!
        author: User!
        createdAt: DateTime!
        updatedAt: DateTime!
        favoriteCount: Int!
        favoritedBy: [User!]
    }
    type User {
        id: ID!
        username: String!
        email: String!
        avatar: String!
        notes: [Note!]!
        favorites: [Note!]!
    }
    type Mutation {
        newNote(content: String!): Note!
        updateNote(id: ID!, content: String!): Note!
        deleteNote(id: ID!): Boolean!
        signUp(username: String!, email: String!, password: String!): String!
        signIn(email: String!, password: String!): String!
        toggleFavorite(id: ID!): Note!
    }
    type NoteFeed {
        notes: [Note!]!
        cursor: String!
        hasNextPage: Boolean!
        
    }
    type Query {
        hello: String
        notes: [Note!]!
        note(id: ID!): Note!
        user(username: String!):
        User users: [User!]!
        me: User!
        noteFeed(cursor: String!): NoteFeed
    }
`