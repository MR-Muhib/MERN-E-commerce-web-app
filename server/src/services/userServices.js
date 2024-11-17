const { default: mongoose } = require("mongoose");
const { deleteImage } = require("../helper/deleteImage");
const users = require("../module/userModule");
const { findWithId } = require("./findItem");
const createError = require("http-errors");
const createHttpError = require("http-errors");

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

module.exports = {
  HandleUserAction,
  findUsers,
  findUserById,
  handleDeleteUserById,
  updateUserById,
};
