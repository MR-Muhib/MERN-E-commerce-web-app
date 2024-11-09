const createError = require("http-errors");
const users = require("../module/userModule");

const getUser = (req, res, next) => {
  try {
    res.status(200).send({
      status: true,
      message: "User retrieved successfully",
      users: users,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUser,
};
