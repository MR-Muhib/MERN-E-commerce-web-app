const express = require("express");
const { seedUsersController } = require("../controller/seedUsersController");
const seedUserRouter = express.Router();

// get the seed routes
seedUserRouter.get("/", seedUsersController);

module.exports = seedUserRouter;
