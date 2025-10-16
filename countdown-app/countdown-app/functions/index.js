// Firebase Cloud Function for sending email using Nodemailer

const functions = require("firebase-functions");
const nodemailer = require("nodemailer");

// 🔐 Use your email credentials (preferably from environment config)
const senderEmail = "youremail@gmail.com";
const senderPassword = "your-app-password"; // Use App Password if Gmail

// Create reusable transporter object using SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: senderEmail,
    pass: senderPassword,
  },
});

// Cloud Function: sendEmail
exports.sendEmail = functions.https.onRequest(async (req, res) => {
  // Allow only POST requests
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const {to, subject, message} = req.body;

  if (!to || !subject || !message) {
    return res.status(400).send("Missing required fields");
  }

  const mailOptions = {
    from: senderEmail,
    to,
    subject,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully to:", to);
    return res.status(200).send("Email sent successfully");
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return res.status(500).send("Failed to send email");
  }
});
