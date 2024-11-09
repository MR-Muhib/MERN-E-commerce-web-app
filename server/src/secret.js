require("dotenv").config();

const serverPort = process.env.SERVER_PORT || 3002;

// export default
module.exports = {
  serverPort,
};
