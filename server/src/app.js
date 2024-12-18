const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const createError = require("http-errors");
const xssClean = require("xss-clean");
const rateLimit = require("express-rate-limit");
const userRouter = require("./routers/userRouter");
const seedUserRouter = require("./routers/seedUserRouter");
const { errorResponse } = require("./controller/responsController");
const authRouter = require("./routers/authRouter");

const app = express();

// Rate limiting middleware
const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many requests from this IP. please try again later",
});

// Middleware to parse incoming JSON requests
app.use(cookieParser());
app.use(rateLimiter);
app.use(xssClean());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/seed", seedUserRouter); //testing server
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);

// Get home page routes
app.get("/", (req, res) => {
  res.json({
    status: 200,
    message: "Welcome to backend server!",
  });
});

// route error handling middleware
app.use((req, res, next) => {
  next(createError(404, "Route Not Found"));
  next();
});

// server error handling middleware Return all the error messages
app.use((err, req, res, next) => {
  return errorResponse(res, {
    statusCode: err.status,
    message: err.message,
  });
});

module.exports = app;
