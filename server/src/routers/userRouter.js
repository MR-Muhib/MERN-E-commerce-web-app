const express = require("express");
const {
  getUser,
  getSingleUser,
  deleteSingleUser,
} = require("../controller/userController");
const userRouter = express.Router();

// home routes
userRouter.get("/", getUser);
userRouter.get("/:id", getSingleUser);
userRouter.delete("/:id", deleteSingleUser);

module.exports = userRouter;
