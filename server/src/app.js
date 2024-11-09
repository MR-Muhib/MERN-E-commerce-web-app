const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const createError = require("http-errors");
const xssClean = require("xss-clean");
var rateLimit = require("express-rate-limit");
const userRouter = require("./routers/userRouter");

const app = express();

// Rate limiting middleware
const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many requests from this IP. please try again later",
});

// Middleware to parse incoming JSON requests
app.use(rateLimiter);
app.use(xssClean());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/user", userRouter);

// user middleware to parse incoming
const isLoggedIn = (req, res, next) => {
  const isLoggedIn = false;
  if (isLoggedIn) {
    // verify token here
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// route error handling middleware
app.use((req, res, next) => {
  next(createError(404, "Route Not Found"));
  next();
});

// server error handling middleware Return all the error messages
app.use((err, req, res, next) => {
  return res.status(err.status || 500).json({
    status: false,
    message: err.message,
  });
});

module.exports = app;
