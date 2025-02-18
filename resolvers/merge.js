const DataLoader = require("dataloader");

const Event = require("../models/event");
const User = require("../models/user");
const { dateToString } = require("../helpers/date");
const superBooking = require("../models/superBooking");

const eventLoader = new DataLoader((eventIds) => {
  return events(eventIds);
});

// for superbbookings
const superBookingsLoader = new DataLoader((superbookingIds) => {
  return superBookings(superbookingIds);
});

const userLoader = new DataLoader((userIds) => {
  return User.find({ _id: { $in: userIds } });
});

const events = async (eventIds) => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    events.sort((a, b) => {
      return (
        eventIds.indexOf(a._id.toString()) - eventIds.indexOf(b._id.toString())
      );
    });
    return events.map((event) => {
      return transformEvent(event);
    });
  } catch (err) {
    throw err;
  }
};

const superBookings = async (superbookingIds) => {
  try {
    const superBookings = await superBooking.find({
      _id: { $in: superbookingIds },
    });
    superBookings.sort((a, b) => {
      return (
        superbookingIds.indexOf(a._id.toString()) -
        superbookingIds.indexOf(b._id.toString())
      );
    });
    return superBookings.map((superBooking) => {
      return transformBooking(superBooking);
      // console.log("this is the super Booking: " + superBooking);
    });
  } catch (err) {
    throw err;
  }
};

// problems with  loader.load andtostring()
const singleEvent = async (eventId) => {
  try {
    const event = await eventLoader.load(eventId.toString());
    return event;
  } catch (err) {
    throw err;
  }
};

const singleSuperBooking = async (superBookingId) => {
  try {
    const superBooking = await superBookingsLoader.load(
      superBookingId.toString()
    );
    return superBooking;
  } catch (err) {
    throw err;
  }
};

const user = async (userId) => {
  try {
    const user = await userLoader.load(userId.toString());
    return {
      ...user._doc,
      _id: user.id,
      createdEvents: () => eventLoader.loadMany(user._doc.createdEvents),
    };
  } catch (err) {
    throw err;
  }
};

const transformEvent = (event) => {
  return {
    ...event._doc,
    _id: event.id,
    date: dateToString(event._doc.date),
    creator: user.bind(this, event.creator),
  };
};

const transformBooking = (booking) => {
  return {
    ...booking._doc,
    _id: booking.id,
    user: user.bind(this, booking._doc.user),
    event: singleEvent.bind(this, booking._doc.event),
    createdAt: dateToString(booking._doc.createdAt),
    updatedAt: dateToString(booking._doc.updatedAt),
  };
};

const transformSuperBooking = (superBooking) => {
  return {
    ...superBooking._doc,
    _id: superBooking.id,
    superBooking: singleSuperBooking.bind(this, superBooking._doc.superBooking),
    fromDate: superBooking.fromDate,
    toDate: superBooking.toDate,
    createdAt: dateToString(superBooking._doc.createdAt),
    updatedAt: dateToString(superBooking._doc.updatedAt),

    creator: user.bind(this, superBooking.creator),
  };
};

exports.transformSuperBooking = transformSuperBooking;
exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;

exports.user = user;
exports.events = events;
exports.singleEvent = singleEvent;
exports.singleSuperBooking = singleSuperBooking;

exports.superBookings = superBookings;
