const createError = require("http-errors");
const jwt = require("jsonwebtoken");

const users = require("../module/userModule");
const { successResponse } = require("./responsController");
const { createJSONWebToken } = require("../helper/jsonWebToken");
const {
  jwtActivationKye,
  smtpClientUrl,
  jwtResetPasswordKye,
} = require("../secret");
const emailWithNodeMailer = require("../helper/email");
const {
  HandleUserAction,
  findUsers,
  findUserById,
  handleDeleteUserById,
  updateUserById,
  forgetPassword,
  resetPassword,
} = require("../services/userServices");

// Get all users except admin.
const getUser = async (req, res, next) => {
  try {
    const search = req.query.search || ""; // Search the users, using query string
    const page = Number(req.query.page) || 1; // Pagination of the page number
    const limit = Number(req.query.limit) || 5; // Number of results to return per page

    const { users, pagination } = await findUsers(search, page, limit);

    return successResponse(res, {
      statusCode: 200,
      message: "User returned successfully",

      payload: {
        users: users, // Return the All user from the database.
        pagination: pagination,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET single user profile
const getSingleUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const option = { password: 0 };

    const user = await findUserById(userId, option);

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
    await handleDeleteUserById(userId, option);
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
    const options = { password: 0 };
    const updatedUser = await updateUserById(userId, req, options);
    if (!updatedUser) {
      throw createError(404, `${users.modelName} does not exist`);
    }

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

// isBanned user
const handleUserStatusById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const action = req.body.action;

    const successMessage = await HandleUserAction(userId, action);

    // Return the user with pagination and search results. controlled responsContoler.js
    return successResponse(res, {
      statusCode: 200,
      message: successMessage,
    });
  } catch (error) {
    next(error);
  }
};

// Update password user
const handleUpdatePassword = async (req, res, next) => {
  try {
    // debugger;
    const userId = req.params.id;
    const { oldPassword, newPassword, confirmPassword, email } = req.body;
    const user = await users.findOne({ email: email }).select("+password");

    if (!user) {
      throw new createError(401, "Invalid email or password");
    }

    // compare password
    if (oldPassword !== user.password) {
      throw new createError(401, "email and password do not match");
    }
    // compare new password and confirm password
    if (newPassword !== confirmPassword) {
      throw new createError(400, "Passwords do not match");
    }

    user.password = newPassword;
    await user.save();

    // update password by id
    const updateUser = await users.findByIdAndUpdate(userId, {
      userId,
      email,
      newPassword,
      oldPassword,
      confirmPassword,
    });

    return successResponse(res, {
      statusCode: 200,
      message: "Password updated successfully",
      payload: {
        user: updateUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Reset Password
const handleForgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const token = await forgetPassword(email);

    return successResponse(res, {
      statusCode: 200,
      message: "Please go to your email and reset your password",
      payload: {
        token, // Return the user from the database.
      },
    });
  } catch (error) {
    next(error);
  }
};

const handleResetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const user = await resetPassword(token, password);

    return successResponse(res, {
      statusCode: 200,
      message: "Password reset successfully",
      payload: { user },
    });
  } catch (error) {
    next(error);
  }
};

// activated User Account

module.exports = {
  getUser,
  getSingleUserById,
  deleteSingleUser,
  prosesRegister,
  activatedUserAccount,
  updateSingleUserById,
  handleUserStatusById, // ban and unban handle req.body
  handleUpdatePassword, // update password handle req.body
  handleForgetPassword, // reset password handle req.body
  handleResetPassword, // reset password handle req.body
};
