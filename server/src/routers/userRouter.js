const express = require("express");
const {
  getUser,
  getSingleUser,
  deleteSingleUser,
  prosesRegister,
  activatedUserAccount,
} = require("../controller/userController");

const userRouter = express.Router();

// home routes
userRouter.post("/proses_register", prosesRegister);
userRouter.post("/verify", activatedUserAccount);
userRouter.get("/", getUser);
userRouter.get("/:id", getSingleUser);
userRouter.delete("/:id", deleteSingleUser);

module.exports = userRouter;
