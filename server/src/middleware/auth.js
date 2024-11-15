const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const { JWT_ACCESS_KYE } = require("../secret");

// Handles authentication user login
const isLoggedIn = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      throw createError(401, "Access token missing");
    }

    const decoded = jwt.verify(token, JWT_ACCESS_KYE);
    if (!decoded) {
      throw createError(401, "Invalid access token");
    }
    req.user = decoded.user;

    next();
  } catch (error) {
    next(error);
  }
};

// Handles authentication user Logout
const isLoggedOut = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_ACCESS_KYE);
        if (decoded) {
          throw createError(400, "User is already logged in.");
        }
      } catch (error) {
        throw error;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

// isAdmin
const isAdmin = (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      throw createError(403, "Unauthorized to access this resource");
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  isLoggedIn,
  isLoggedOut,
  isAdmin,
};
