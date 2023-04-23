const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql").graphqlHTTP;
const { buildSchema } = require("graphql");
const bcrypt = require("bcryptjs");

const mongoose = require("mongoose");

const Event = require("./models/event");
const User = require("./models/user");

const app = express();

app.use(bodyParser.json());

const events = (eventsIds) => {
  return Event.find({ _id: { $in: eventsIds } })
    .then((events) => {
      return events.map((event) => {
        return {
          ...event._doc,
          _id: event.id,
          creator: user.bind(this, events.creator),
        };
      });
    })
    .catch((err) => {
      throw err;
    });
};

const user = (userId) => {
  return User.findById(userId)
    .then((user) => {
      return {
        ...user._doc,
        _id: user.id,
        createdEvents: events.bind(this, user._doc.createdEvents),
      };
    })
    .catch((err) => {
      throw err;
    });
};

app.use(
  "/graphql",
  graphqlHttp({
    schema: buildSchema(`

        type Event{
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
            creator: User!
        }

        type User{
          _id: ID!
          email: String!
          password: String
          createdEvents: [Event!]
        }

        input EventInput{
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input UserInput{
          email: String!
          password: String!
        }

        type RootQuery{
            events: [Event!]!
        }

        type RootMutation{
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }

        schema{
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
      events: () => {
        return Event.find()
          .then((events) => {
            return events.map((event) => {
              return {
                ...event._doc,
                creator: user.bind(this, event._doc.creator),
              };
            });
          })
          .catch((err) => {
            throw err;
          });
      },
      createEvent: (args) => {
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: args.eventInput.price,
          date: new Date(args.eventInput.date),
          creator: "6444491ffbd35c71aac88b8c",
        });

        let createdEvent;

        //using return below to tell graphql that it will be an async func.
        return event
          .save()
          .then((result) => {
            createdEvent = {
              ...result._doc,
              creator: user.bind(this, result._doc.creator),
            };
            return User.findById("6444491ffbd35c71aac88b8c");
          })
          .then((user) => {
            if (!user) {
              throw new Error("User not found!");
            }

            //createdEvents in user model
            user.createdEvents.push(event);
            return user.save();
          })
          .then((result) => {
            return createdEvent;
          })
          .catch((err) => {
            console.log(err);
            throw err;
          });
      },

      createUser: (args) => {
        return User.findOne({ email: args.userInput.email })
          .then((user) => {
            if (user) {
              throw new Error("User already exists.");
            }
            return bcrypt.hash(args.userInput.password, 12);
          })
          .then((hashedPassword) => {
            const user = new User({
              email: args.userInput.email,
              password: hashedPassword,
            });
            return user.save();
          })
          .then((result) => {
            return { ...result._doc, password: null };
          })
          .catch((err) => {
            throw err;
          });
      },
    },
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
