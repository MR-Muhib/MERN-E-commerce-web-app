const createHttpError = require("http-errors");
const users = require("../module/userModule");
const JWT_ACCESS_KYE = require("../secret");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { successResponse } = require("./responsController");
const { createJSONWebToken } = require("../helper/jsonWebToken");

const handleLogin = async (req, res, next) => {
  try {
    // debugger;
    // Destructure email and password from req.body
    const { email, password } = req.body;

    // const user = await users.findOne({ email: email, password: user.password }).select("+password");

    if (!email || !password) {
      throw new createHttpError(400, "Email and password are required");
    }

    // Check if user exists in the database
    const user = await users
      .findOne({ email: email, password: password })
      .select("+password");
    if (!user) {
      throw new createHttpError(401, "Invalid email or password");
    }
    // console.warn(user.password);

    // isBanned
    if (user.isBanned) {
      throw new createHttpError(401, "Your account has been banned");
    }

    // token cookie
    const accessToken = createJSONWebToken(
      { email },
      process.env.JWT_ACCESS_KYE,
      "10m"
    );
    res.cookie("access_token", accessToken, {
      maxAge: 15 * 60 * 1000, //15 minutes
      httpOnly: true,
      // secure: true, // Only send cookie over HTTPS
      sameSite: "none",
      httpOnly: true,
    });

    // Find user by email

    // Compare the password with hashed password stored in the database

    // Send a successful response
    return successResponse(res, {
      statusCode: 200,
      message: "Logged in successfully",
      payload: {
        user,
      },
    });
  } catch (error) {
    // Forward error to error-handling middleware
    next(error);
  }
};

module.exports = handleLogin;
