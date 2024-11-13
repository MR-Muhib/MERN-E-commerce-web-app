const { Schema, model } = require("mongoose");

const bcrypt = require("bcryptjs");

const { defaultImagePath } = require("../secret");

const userShema = new Schema(
  {
    name: {
      type: String,
      required: [true, "User name is requiered"],
      trim: true,
      lowercase: true,
      minlength: [3, "the user name length must be between 3 and 50"],
      maxlength: [50, "the user name length must be between 3 and 50"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please enter a valid email address",
      ],
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: [8, "The password length must be at least 8 characters long"],
      select: false, // this field will not be returned when we fetch user data
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ],
    },
    image: {
      type: String,
      default: defaultImagePath,
    },
    address: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      match: [/^\+?1?\d{1,15}$/, "Please enter a valid phone number"],
      unique: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const users = model("users", userShema);
module.exports = users;
