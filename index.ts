const express = require('express');
const bodyParser = require('body-parser');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
const { makeExecutableSchema } = require('graphql-tools');
import 'reflect-metadata'
import {createConnection, Connection, getConnectionManager, getManager} from "typeorm";

const getConnection = async function() {
  const connection = await createConnection({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "postgres",
      password: "postgres",
      database: "atelight_books"
  });

  return connection;
}


import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Book {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    author: string;

    @Column()
    title: string;
}

const start = async () => {
  await getConnection();

  // Some fake data
  let books = [
    {
      title: "Harry Potter and the Sorcerer's stone",
      author: 'J.K. Rowling',
    },
    {
      title: 'Jurassic Park',
      author: 'Michael Crichton',
    },
  ];

  // The GraphQL schema in string form
  const typeDefs = `
  type Book {
    title: String,
    author: String
  }

  type Query {
    books: [Book]
  }

  type Mutation {
    addBook(title: String!, author: String!): Book
  }
`;

  // The resolvers
  const resolvers = {
    Query: {
      books: () => getManager().find(Book)
    },
    Mutation: {
      addBook: (_parent, { title, author }, _context) => {
        books.push({ title, author });
        return { title, author }
      }
    }
  };

  // Put together a schema
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  // Initialize the app
  const app = express();

  // The GraphQL endpoint
  app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));

  // GraphiQL, a visual editor for queries
  app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

  // Start the server
  app.listen(3000, () => {
    console.log('Go to http://localhost:3000/graphiql to run queries!');
  });
}
start()