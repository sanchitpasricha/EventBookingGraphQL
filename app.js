const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql").graphqlHTTP;
const mongoose = require("mongoose");

const graphQlSchema = require("./graphql/schema/index");
const graphQlResolver = require("./graphql/resolvers/index");

const app = express();

app.use(bodyParser.json());

app.use(
  "/graphql",
  graphqlHttp({
    schema: graphQlSchema,
    rootValue: graphQlResolver,
    graphiql: true,
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.sda1shk.mongodb.net/${process.env.MONGO_DB}`
  )
  .then(() => {
    app.listen(3000, () => {
      console.log("Server running & DB connected");
    });
  })
  .catch((err) => {
    console.log(err);
  });
