const { validationResult } = require("express-validator");
const { errorResponse } = require("../controller/responsController");

// middleware to validate form data
const runValidation = async (req, res, next) => {
  try {
    const errors = await validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, {
        statusCode: 422,
        message: errors.array()[0].msg,
      });
    }

    return next();
  } catch (error) {
    return next(
      errorResponse(res, {
        statusCode: 500,
        message: "Validation error! Please check your data information",
      })
    );
  }
};

module.exports = {
  runValidation,
};
