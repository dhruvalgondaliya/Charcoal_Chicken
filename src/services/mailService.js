import nodemailer from "nodemailer";
import mailConfig from "../Config/mailConfig.js";

const transporter = nodemailer.createTransport(mailConfig);

export default async function sendMail(to, subject, text) {
  const mailOptions = {
    from: mailConfig.auth.user,
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("=========testing Email sent======: " + info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}