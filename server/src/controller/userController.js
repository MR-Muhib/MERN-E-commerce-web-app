const createError = require("http-errors");

const getUser = (req, res, next) => {
  try {
    res.status(200).send({
      status: true,
      message: "User returned successfully",
      users: users,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUser,
};
