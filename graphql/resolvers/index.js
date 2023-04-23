const bcrypt = require("bcryptjs");

const Event = require("../../models/event");
const User = require("../../models/user");

const events = async (eventsIds) => {
  try {
    const events = await Event.find({ _id: { $in: eventsIds } });
    events.map((event) => {
      return {
        ...event._doc,
        _id: event.id,
        creator: user.bind(this, events.creator),
      };
    });
  } catch (err) {
    throw err;
  }
};

const user = async (userId) => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc,
      _id: user.id,
      createdEvents: events.bind(this, user._doc.createdEvents),
    };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      return events.map((event) => {
        return {
          ...event._doc,
          creator: user.bind(this, event._doc.creator),
        };
      });
    } catch (err) {
      throw err;
    }
  },
  createEvent: async (args) => {
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: "6444491ffbd35c71aac88b8c",
    });

    let createdEvent;

    //using return below to tell graphql that it will be an async func.
    try {
      const result = await event.save();

      createdEvent = {
        ...result._doc,
        creator: user.bind(this, result._doc.creator),
      };
      const creatorUser = await User.findById("6444491ffbd35c71aac88b8c");

      if (!creatorUser) {
        throw new Error("User not found!");
      }

      //createdEvents in user model
      creatorUser.createdEvents.push(event);
      await creatorUser.save();

      return createdEvent;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  createUser: async (args) => {
    try {
      const userExist = await User.findOne({ email: args.userInput.email });
      if (userExist) {
        throw new Error("User already exists.");
      }
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);

      const user = new User({
        email: args.userInput.email,
        password: hashedPassword,
      });
      const result = await user.save();
      return { ...result._doc, password: null };
    } catch (err) {
      throw err;
    }
  },
};
