const { body } = require("express-validator");

// Validate User Registration
const validateUserRegistration = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("User name is required, Please enter your full name.")
    .isLength({ min: 3, max: 50 })
    .withMessage("The name length must be between 3 and 50"),
  body("email")
    .trim()
    .notEmpty()
    .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .withMessage("Email is required, Please enter a valid email address"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage(
      "Password is required, At least one digit [0-9] At, least one lowercase character [a-z] At least one uppercase character [A-Z] At least one special character [*.! @#$%^&(){}[]:;<>,.?/~_+-=|] At least 8 characters in length, but no more than 20"
    )
    .isLength({ min: 8, max: 20 })
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .withMessage("The email length must be between 6 and 20"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required, Please enter a valid phone number")
    .isLength({ min: 11, max: 11 })
    .withMessage("The phone number must be 11 digits long"),
  body("address")
    .trim()
    .notEmpty()
    .withMessage("Address is required, Please enter a valid Address"),

  body("image").optional().isString(),
];

module.exports = { validateUserRegistration };

/* 
 body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),
     */
