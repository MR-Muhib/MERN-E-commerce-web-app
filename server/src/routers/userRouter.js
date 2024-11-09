const express = require("express");
const { getUser } = require("../controller/userController");
const userRouter = express.Router();

// home routes
userRouter.get("/", getUser);

// user routes
userRouter.get("/:id", (req, res) => {
  res.json({
    status: 200,
    message: "Hello, World!",
  });
});

module.exports = userRouter;
