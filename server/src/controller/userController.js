const createError = require("http-errors");
const jwt = require("jsonwebtoken");
// console.log(jwt);

const fs = require("fs");

const users = require("../module/userModule");
const { successResponse } = require("./responsController");
const { findWithId } = require("../services/findItem");
const { deleteImage } = require("../helper/deleteImage");
const { createJSONWebToken } = require("../helper/jsonWebToken");
const { jwtActivationKye, smtpClientUrl } = require("../secret");
const emailWithNodeMailer = require("../helper/email");

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
    // console.warn("user id :-" + req.body.userId);
    // console.warn(req.user);
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

    await users.findByIdAndDelete({
      _id: userId,
      isAdmin: false,
    });

    // delete image
    if (user && user.image) {
      await deleteImage(user.image);
    }

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
    const { name, email, password, phone, address } = req.body;

    const image = req.file.path;
    if (image && image.size > 1024 * 1024 * 2) {
      throw createError(400, "Image size should be less than 2MB");
    }

    const userExists = await users.exists({ email: email });
    if (userExists) {
      throw createError(409, "Email already registered, please logged in");
    }

    // Json web token
    const token = createJSONWebToken(
      { name, email, password, phone, address, image: image },
      jwtActivationKye,
      "10m"
    );

    // Prepare Email Address
    const emailData = {
      email,
      subject: "Registration Confirmation",
      html: `
      <h2>Hello ${name}!</h2>
      <p>Please click the link below to confirm your registration:</p>
      <a href="${smtpClientUrl}/api/auth/activate/${token}">Confirm Registration</a>
      `,
    };

    // send email with nodeMailer
    try {
      await emailWithNodeMailer(emailData);
    } catch (err) {
      console.error("Failed to send email", err);
      throw createError(500, "Failed to send email, please try again later");
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Please go to your email and verify your registration",
      payload: {
        token, // Return the user from the database.
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user information and save the database
const activatedUserAccount = async (req, res, next) => {
  try {
    const token = req.body.token;

    if (!token) {
      throw createError(401, "Token is required");
    }

    const decoded = jwt.verify(token, jwtActivationKye);
    // console.warn(decoded);
    if (!decoded) {
      throw createError(404, "Invalid or expired token");
    }

    // userExist
    const userExists = await users.exists({ email: decoded.email });
    if (userExists) {
      console.warn(
        `Attempted registration with existing email: ${decoded.email}`
      );
      throw createError(409, "User already exists! Please login instead.");
    }
    // create new user
    await users.create(decoded);

    return successResponse(res, {
      statusCode: 201,
      message: "Registration created successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Update single user by id
const updateSingleUserById = async (req, res, next) => {
  try {
    // debugger;
    const userId = req.params.id;
    const updateOption = { new: true, runValidator: true, context: "query" };

    const options = { password: 0 };
    const user = await findWithId(users, userId, options);

    if (!user) {
      throw createError(404, `${users.modelName} does not exist`);
    }

    const update = {};

    // Update information users can access
    for (const key in req.body) {
      if (["name", "password", "phone", "address"].includes(key)) {
        update[key] = req.body[key];
      } else if (["email"].includes(key)) {
        throw new Error("Email dose not updated");
      }
    }

    // Update user image from existing
    const image = req.file;
    if (image) {
      // Verify image size does not exceed 2MB
      if (image.size > 1024 * 1024 * 2) {
        throw createError(400, "Image size should not exceed 2MB");
      }

      // Assign new image to the update object
      update.image = image.path;

      // Optional: Delete the user's old image if it exists and is not the default
      if (user.image && user.image !== "default.png") {
        deleteImage(user.image);
      }
    }

    const updatedUser = await users.findByIdAndUpdate(
      userId,
      update,
      updateOption
    );

    if (!updatedUser) {
      throw createError(404, `${users.modelName} does not exist`);
    }

    // Return the user with pagination and search results. controlled responsContoler.js
    return successResponse(res, {
      statusCode: 200,
      message: "User Updated successfully",
      payload: {
        user: updatedUser, // Return the user from the database.
      },
    });
  } catch (error) {
    next(error);
  }
};

// activated User Account

module.exports = {
  getUser,
  getSingleUser,
  deleteSingleUser,
  prosesRegister,
  activatedUserAccount,
  updateSingleUserById,
};
