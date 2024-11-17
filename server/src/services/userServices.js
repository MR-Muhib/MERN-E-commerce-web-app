const { default: mongoose } = require("mongoose");
const { deleteImage } = require("../helper/deleteImage");
const users = require("../module/userModule");
const { findWithId } = require("./findItem");
const createError = require("http-errors");
const createHttpError = require("http-errors");
const { createJSONWebToken } = require("../helper/jsonWebToken");
const { smtpClientUrl, jwtResetPasswordKye } = require("../secret");
const emailWithNodeMailer = require("../helper/email");
const jwt = require("jsonwebtoken");

const findUsers = async (search, page, limit) => {
  try {
    // Using regular expression to filter results
    const searchRegExp = new RegExp(".*" + search + ".*", "i"); // Not demand for first nad last values, and i for case sensitive

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
      return next(createHttpError(404, "User not found"));
    }
    return {
      users: user,
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
    };
  } catch (error) {
    throw error;
  }
};

// find single user by id
const findUserById = async (userId, option) => {
  try {
    const user = await users.findById(userId, option);
    if (!user) {
      throw createError(404, `${users.modelName} does not exist`);
    }

    return user;
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      throw createError(400, "Invalid user id");
    }
    throw error;
  }
};

// delete single user by id
const handleDeleteUserById = async (userId, option) => {
  try {
    const user = await users.findByIdAndDelete({
      _id: userId,
      isAdmin: false,
    });

    // delete image
    if (user && user.image) {
      await deleteImage(user.image);
    }
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      throw createError(400, "Invalid user id");
    }
    throw error;
  }
};

// update single user by id
const updateUserById = async (userId, req) => {
  try {
    const user = await findUserById(userId);
    const updateOption = { new: true, runValidator: true, context: "query" };
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
    return updatedUser;
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      throw createError(400, "Invalid user id");
    }
    throw error;
  }
};

// handle forget password by email
const forgetPassword = async (email) => {
  try {
    if (!email) {
      throw new createError(400, "Email is required");
    }

    const user = await users.findOne({ email: email });

    if (!user) {
      throw new createError(404, "User does not exist in this email address");
    }

    // Json web token
    const token = createJSONWebToken({ email }, jwtResetPasswordKye, "10m");

    // Prepare Email Address
    const emailData = {
      email,
      subject: "Reset Password",
      html: `
      <h2>Hello ${user.name}!</h2>
      <p>Please click the link below to confirm your reset password:</p>
      <a href="${smtpClientUrl}/api/user/reset-password/${token}">Confirm reset password</a>
      `,
    };

    // send email with nodeMailer
    try {
      await emailWithNodeMailer(emailData);
    } catch (err) {
      console.error("Failed to send email", err);
      throw createError(500, "Failed to send email, please try again later");
    }
    return token;
  } catch (error) {
    throw error;
  }
};

// Handle isBanned and unbanned users
const HandleUserAction = async (userId, action) => {
  try {
    const user = await findWithId(users, userId);

    if (!user) {
      throw createError(404, `${users.modelName} does not exist`);
    }

    if (!action) {
      throw createError(400, "Action is required");
    }

    let update;
    let successMessage;

    if (action === "ban") {
      update = { isBanned: true };
      successMessage = "User banned successfully";
    } else if (action === "unban") {
      update = { isBanned: false };
      successMessage = "User unbanned successfully";
    } else {
      throw createError(400, "Invalid action");
    }

    const updateOption = { new: true, runValidator: true, context: "query" };

    const updatedUser = await users.findByIdAndUpdate(
      userId,
      update,
      updateOption
    );

    if (!updatedUser) {
      throw createError(404, `${users.modelName} does not exist`);
    }

    return successMessage;
  } catch (error) {
    throw error;
  }
};

// handle reset password by token
const resetPassword = async (token, password) => {
  try {
    if (!token || !password) {
      throw createError(400, "Token or Password is required");
    }

    const decoded = await jwt.verify(token, jwtResetPasswordKye);
    if (!decoded) {
      throw createError(401, "Invalid token or password");
    }

    // save password database
    const user = await users.findOneAndUpdate(
      { email: decoded.email },
      { password: password },
      { new: true }
    );

    if (!user) {
      throw new createError(404, "User does not exist");
    }
    return user;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  HandleUserAction,
  findUsers,
  findUserById,
  handleDeleteUserById,
  forgetPassword,
  updateUserById,
  resetPassword,
};
