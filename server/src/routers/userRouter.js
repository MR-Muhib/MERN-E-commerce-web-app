const express = require("express");
const userRouter = express.Router();

const {
  getUser,
  deleteSingleUser,
  prosesRegister,
  activatedUserAccount,
  updateSingleUserById,
  handleUserStatusById,
  getSingleUserById,
  handleUpdatePassword,
  handleForgetPassword,
  handleResetPassword,
} = require("../controller/userController");

const upload = require("../middleware/uploadFile");
const {
  validateUserRegistration,
  // validateResetPassword,
} = require("../validetors/auth");

const { runValidation } = require("../validetors");
const { isLoggedIn, isLoggedOut, isAdmin } = require("../middleware/auth");

// users Registration format
userRouter.post(
  "/proses_register",
  upload.single("image"),
  isLoggedOut,
  validateUserRegistration,
  runValidation,
  prosesRegister
);

userRouter.post("/activate", isLoggedOut, activatedUserAccount);
userRouter.get("/", isLoggedIn, isAdmin, getUser);
userRouter.get("/:id([0-9a-fA-F]{24})", isLoggedIn, getSingleUserById);
userRouter.delete("/:id([0-9a-fA-F]{24})", isLoggedIn, deleteSingleUser);

userRouter.put(
  "/:id",
  upload.single("image"),
  isLoggedIn,
  updateSingleUserById
);

// user banned and unbanned status
userRouter.put(
  "/user-status/:id([0-9a-fA-F]{24})",
  isLoggedIn,
  isAdmin,
  handleUserStatusById
);

userRouter.put("/update-password/:id", isLoggedIn, handleUpdatePassword);
userRouter.post("/forget-password", handleForgetPassword);
userRouter.patch("/reset-password", handleResetPassword);

module.exports = userRouter;
