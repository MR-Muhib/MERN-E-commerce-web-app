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

// users Registration format
userRouter.post(
  "/proses_register",
  upload.single("image"),
  validateUserRegistration,
  runValidation,
  prosesRegister
);

userRouter.post("/activate", activatedUserAccount);
userRouter.get("/", getUser);
userRouter.get("/:id", getSingleUser);
userRouter.delete("/:id", deleteSingleUser);
userRouter.put("/:id", upload.single("image"), updateSingleUserById);

module.exports = userRouter;
