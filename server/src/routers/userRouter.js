const express = require("express");
const userRouter = express.Router();

const {
  getUser,
  getSingleUser,
  deleteSingleUser,
  prosesRegister,
  activatedUserAccount,
  updateSingleUserById,
} = require("../controller/userController");

const upload = require("../middleware/uploadFile");
const { validateUserRegistration } = require("../validetors/auth");
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
userRouter.get("/:id", isLoggedIn, getSingleUser);
userRouter.delete("/:id", isLoggedIn, deleteSingleUser);
userRouter.put(
  "/:id",
  upload.single("image"),
  isLoggedIn,
  updateSingleUserById
);

module.exports = userRouter;
