const createError = require("http-errors");
const mongoose = require("mongoose");

const findWithId = async (Model, userId, option = {}) => {
  try {
    // Find single user from database.
    const item = await Model.findById(userId, option);

    // If there is no result found, return 404 Not Found.
    if (!item) {
      return next(createError(404, `${Model.modelName} does not exist`));
    }

    return item;
  } catch (error) {
    // custom error handling
    if (error instanceof mongoose.Error) {
      throw createError(400, `Invalid ${Model.modelName} id`);
    }
    throw error;
  }
};

module.exports = {
  findWithId,
};
