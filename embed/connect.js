const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const connect = async () => {


  try {
    mongoose.connect(MONGODB_URI, {
      dbName: "embed",
      bufferCommands: true,
    });
    console.log("Connected");
  } catch (err) {
    console.log("Error: ", err);
    throw new Error("Error: ", err);
  }
};

module.exports= {connect};