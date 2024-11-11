const nodemailer = require("nodemailer");
const { smtpUserName, smtpPassword } = require("../secret");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: smtpUserName,
    pass: smtpPassword,
  },
});

const sendVerificationNodeMail = async (verificationToken) => {
  try {
    const mailOptions = {
      from: `"E-commerce App" <${smtpUserName}>`,
      to: verificationToken.email,
      subject: "E-commerce App - Verify Your Email",
      text: verificationToken.text,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(`Message sent to ${info} with`);
  } catch (error) {
    console.error("Failed to send verification email: ", error.message);
    throw error;
  }
};

module.exports = { sendVerificationNodeMail };
