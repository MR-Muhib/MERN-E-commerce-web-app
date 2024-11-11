const jwt = require("jsonwebtoken");

const createJSONWebToken = (payload, secretKye, expiresIn) => {
  if (typeof payload !== "object" || !payload) {
    throw new Error("Payload must be a non-empty object");
  }

  if (typeof secretKye !== "string" || secretKye === "") {
    throw new Error("Secret key must be a non-empty string");
  }

  try {
    const token = jwt.sign(payload, secretKye, { expiresIn });
    return token;
  } catch (error) {
    throw new Error("Failed to create JWT token");
  }
};

module.exports = { createJSONWebToken };
