const express = require("express");
const morgan = require("morgan");

const app = express();
const port = 5000;

// Middleware to parse incoming JSON requests
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// home routes
app.get("/", (req, res) => {
  res.json({
    status: 200,
    message: "Welcome to backend server",
    timestamp: new Date().toISOString(),
  });
});

// user routes
app.get("/api/user", isLoggedIn, (req, res) => {
  res.json({
    status: 200,
    message: "Hello, World!",
    data: null,
    timestamp: new Date().toISOString(),
  });
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
