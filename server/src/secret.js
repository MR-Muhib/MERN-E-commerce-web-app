require("dotenv").config();

const serverPort = process.env.SERVER_PORT || 3002;
const mongodbURL =
  process.env.MONGODB_ATLAS_URL || "mongodb://localhost:27017/E-commerceMernDB";

const defaultImagePath =
  process.env.DEFAULT_USER_IMAGE_PATH || "public/images/users/photo.png";

const jwtActivationKye =
  process.env.JWT_ACTIVATION_KYE || "jsdhfdfdjs54_5458df";

const JWT_ACCESS_KYE = process.env.JWT_ACCESS_KYE || "JDSFJ_6DF$@DFSDFDS";

const smtpUserName = process.env.SMTP_USERNAME || "";
const smtpPassword = process.env.SMTP_PASSWORD || "";
const smtpClientUrl = process.env.CLIENT_URL || "";

// export default
module.exports = {
  serverPort,
  mongodbURL,
  defaultImagePath,
  jwtActivationKye,
  smtpUserName,
  smtpPassword,
  smtpClientUrl,
  JWT_ACCESS_KYE,
};
