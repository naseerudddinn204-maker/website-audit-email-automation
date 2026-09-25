const nodemailer = require("nodemailer");

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = String(process.env.SMTP_SECURE || "true").toLowerCase() === "true";

  if (!host || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP_HOST, SMTP_USER and SMTP_PASS must be configured.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

async function sendEmail({ to, subject, text }) {
  if (!to) throw new Error("Recipient email is required.");

  const transporter = getTransporter();
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;

  return transporter.sendMail({
    from,
    to,
    subject,
    text
  });
}

module.exports = { sendEmail };
