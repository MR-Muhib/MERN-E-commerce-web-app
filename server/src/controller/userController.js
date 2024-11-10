const createError = require("http-errors");
const users = require("../module/userModule");

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
        // serach searchRegExp name, email and phone number
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
    // Return the user with pagination and search results.
    res.status(200).send({
      status: true,
      message: "User returned successfully",
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
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUser,
};
