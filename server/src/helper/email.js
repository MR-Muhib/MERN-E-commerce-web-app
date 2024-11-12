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

const emailWithNodeMailer = async (emailData) => {
  try {
    const mailOptions = {
      from: `"E-commerce App" <${smtpUserName}>`,
      to: emailData.email,
      subject: "E-commerce App - Verify Your Email",
      html: emailData.html,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.response);
  } catch (error) {
    console.error("Error sending email: ", error);
    throw error;
  }
};

module.exports = emailWithNodeMailer;
