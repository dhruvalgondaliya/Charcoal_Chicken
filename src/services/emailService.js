import nodemailer from "nodemailer";
import mailConfig from "../config/mailConfig.js";
import { generateOrderReceiptHTML, generateOrderReceiptText } from "../templates/orderReceiptTemplate.js";

const transporter = nodemailer.createTransport(mailConfig);

// Function to send order receipt email
export const sendOrderReceiptEmail = async (order, customerEmail, customerName) => {
  const orderNumber = order.orderNumber || order._id;
  
  const mailOptions = {
    from: `"Your Restaurant" <${mailConfig.auth.user}>`,
    to: customerEmail,
    subject: `Order Receipt - Order #${orderNumber}`,
    text: generateOrderReceiptText(order, customerName),
    html: generateOrderReceiptHTML(order, customerName)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Order receipt email sent: " + info.response);
    return info;
  } catch (error) {
    console.error("Error sending order receipt email:", error);
    throw error;
  }
};

// Generic send mail function (if you still need it)
export const sendMail = async (to, subject, text, html) => {
  const mailOptions = {
    from: mailConfig.auth.user,
    to,
    subject,
    text,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};