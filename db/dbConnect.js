const mongoose = require("mongoose");
require("dotenv").config();

async function dbConnect() {
  try {
    mongoose.set("strictQuery", false); // Tắt cảnh báo strictQuery
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Successfully connected to MongoDB Atlas!");
  } catch (error) {
    console.error("Unable to connect to MongoDB Atlas!", error);
    throw error;
  }
}

module.exports = dbConnect;