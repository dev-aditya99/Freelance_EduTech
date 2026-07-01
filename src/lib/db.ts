import { connect } from "mongoose";

const mongoDB_URI = process.env.MONGODB_URI;

if (!mongoDB_URI) {
  throw new Error("Database URL not found!");
}

let cachedDB = global.mongoose;

if (!cachedDB) {
  cachedDB = global.mongoose = { conn: null, promise: null };
}

// Connect DB
const connectDB = async () => {
  if (cachedDB.conn) {
    return cachedDB.conn;
  }

  if (!cachedDB.promise) {
    cachedDB.promise = connect(mongoDB_URI).then((c) => c.connection);
  }

  try {
    cachedDB.conn = await cachedDB.promise;
  } catch (error) {
    throw error;
  }

  return cachedDB.conn;
};

export default connectDB;
