const express = require("express");
const {
  getUser,
  getSingleUser,
  deleteSingleUser,
  prosesRegister,
} = require("../controller/userController");

const userRouter = express.Router();

// home routes
userRouter.post("/proses_register", prosesRegister);
userRouter.get("/", getUser);
userRouter.get("/:id", getSingleUser);
userRouter.delete("/:id", deleteSingleUser);

module.exports = userRouter;
