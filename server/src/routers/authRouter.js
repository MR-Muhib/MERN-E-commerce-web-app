const express = require("express");

// const runValidation = require("../validetors");/
const handleLogin = require("../controller/authController");

const authRouter = express.Router();

authRouter.post("/login", handleLogin);

module.exports = authRouter;
