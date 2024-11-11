const createError = require("http-errors");
const fs = require("fs");

const users = require("../module/userModule");
const { successResponse } = require("./responsController");
const { findWithId } = require("../services/findItem");
const { deleteImage } = require("../helper/deleteImage");
const { createJSONWebToken } = require("../helper/jsonWebToken");
const { jwtActivationKye } = require("../secret");
const { sendVerificationNodeMail } = require("../helper/email");

// Get all users except admin.
const getUser = async (req, res, next) => {
  try {
    const serach = req.query.serach || ""; // Search the users, using query string
    const page = Number(req.query.page) || 1; // Pagination of the page number
    const limit = Number(req.query.limit) || 5; // Number of results to return per page

    // Using regular expression to filter results
    const searchRegExp = new RegExp(".*" + serach + ".*", "i"); // Not demand for first nad last values, and i for case sensitive

    const filter = {
      isAdmin: { $ne: true }, // Admin not allowed to filter results
      $or: [
        //  searchRegExp name, email and phone number
        { name: { $regex: searchRegExp } },
        { email: { $regex: searchRegExp } },
        { phone: { $regex: searchRegExp } },
      ],
    };

    // password not returned from search
    const option = { password: 0 };

    // Find All Users from database.
    const user = await users
      .find(filter, option)
      .limit(limit)
      .skip((page - 1) * limit); // Pagination

    // Count total users from database.
    const count = await users.find(filter).countDocuments();

    // If there is no result found, return 404 Not Found.
    if (!user) {
      return next(createError(404, "User not found"));
    }
    // Return the user with pagination and search results. controlled responsContoler.js
    return successResponse(res, {
      statusCode: 200,
      message: "User returned successfully",
      payload: {
        users: user, // Return the All user from the database.
        pagination: {
          page: page,
          limit: limit,
          totalPages: Math.ceil(count / limit),
          totalUsers: count,
          hasNextPage: page * limit < count,
          hasPreviousPage: page > 1,
          nextPage: page + 1 <= Math.ceil(count / limit) ? page + 1 : null, //
          previousPage: page - 1 > 0 ? page - 1 : null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET single user profile
const getSingleUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // password not returned from search
    const option = { password: 0 };

    const user = await findWithId(users, userId, option, next);

    // Return the user with pagination and search results. controlled responsContoler.js
    return successResponse(res, {
      statusCode: 200,
      message: "User returned successfully by id",
      payload: {
        user, // Return the user from the database.
      },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE single user profile
const deleteSingleUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const option = { password: 0 };

    const user = await findWithId(users, userId, option);
    const userImagePath = user.image;

    deleteImage(userImagePath);

    await users.findByIdAndDelete({
      _id: userId,
      isAdmin: false,
    });

    // Return the user with pagination and search results. controlled responsContoler.js
    return successResponse(res, {
      statusCode: 200,
      message: "User Delete successfully",
    });
  } catch (error) {
    next(error);
  }
};

// GET single user profile
const prosesRegister = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, image } = req.body;

    const userExists = await users.exists({ email: email });
    if (userExists) {
      throw createError(409, "Email already registered, please logged in");
    }

    // Json web token
    const token = createJSONWebToken(
      { name, email, password, phone, address, image },
      jwtActivationKye,
      "10m"
    );

    // Prepare Email Address
    const verificationToken = {
      from: name,
      to: email,
      subject: "Registration Confirmation",
      text: `
        Please click on the link below to confirm your registration:
        http://localhost:3000/api/auth/activate/${token}
      `,
    };

    // send email with nodeMailer
    try {
      await sendVerificationNodeMail(verificationToken);
    } catch (error) {
      throw createError(500, "Failed to send email verification");
    }

    // save tokens database
    const savedUser = await users.create({ ...req.body, token });

    return successResponse(res, {
      statusCode: 200,
      message: "Please go to your email and verify your registration",
      payload: {
        // savedUser: savedUser,
        token, // Return the user from the database.
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUser,
  getSingleUser,
  deleteSingleUser,
  prosesRegister,
};
