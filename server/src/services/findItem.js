const createError = require("http-errors");
const mongoose = require("mongoose");
const users = require("../module/userModule");

const findWithId = async (userId, option = {}) => {
  try {
    // Find single user from database.
    const item = await users.findById(userId, option);

    // If there is no result found, return 404 Not Found.
    if (!item) {
      return next(createError(404, "User not found"));
    }

    return item;
  } catch (error) {
    // custom error handling
    if (error instanceof mongoose.Error) {
      throw createError(400, "Invalid item id");
    }
    throw error;
  }
};

module.exports = {
  findWithId,
};
