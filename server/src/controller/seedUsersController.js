const data = require("../data");
const User = require("../module/userModule");

const seedUsersController = async (req, res, next) => {
  try {
    // delete all existing users
    await User.deleteMany({});

    // create new users
    const users = await User.insertMany(data.users);

    // Successful messages
    return res.status(201).json(users);
  } catch (error) {
    // console.log(error);
    console.log("The error message is: ", error.message);
  }
};

module.exports = {
  seedUsersController,
};
