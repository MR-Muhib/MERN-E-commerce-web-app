const mongoose = require("mongoose");
const { mongodbURL } = require("../secret");

// db.connect function

const connectDatabase = async (option = {}) => {
  try {
    await mongoose.connect(mongodbURL, option);
    console.log("MongoDB Connected...");

    mongoose.connection.on("error", (error) =>
      console.error("DB conncetion error: ", error)
    );
  } catch (error) {
    console.error("Could not connect to DB:", error.toString());
    // process.exit(1);
  }
};

module.exports = connectDatabase;
