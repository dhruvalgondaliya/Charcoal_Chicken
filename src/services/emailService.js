import nodemailer from "nodemailer";
import mailConfig from "../config/mailConfig.js";
import {
  generateOrderReceiptHTML,
  generateOrderReceiptText,
} from "../templates/orderReceiptTemplate.js";
import { generateOrderCancelledHTML } from "../templates/orderCancelledTemplate.js";

const transporter = nodemailer.createTransport(mailConfig);

// Function to send order receipt email
export const sendOrderReceiptEmail = async (
  order,
  customerEmail,
  customerName,
  imageurl,
  restaurantName
) => {
  const orderNumber = order.orderNumber || order._id;

  const mailOptions = {
    from: `"${restaurantName || ""}" <${mailConfig.auth.user}>`,
    to: customerEmail,
    subject: `Order Receipt - Order #${orderNumber}`,
    text: generateOrderReceiptText(order, customerName, restaurantName),
    html: generateOrderReceiptHTML(
      order,
      customerName,
      imageurl,
      restaurantName
    ),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw error;
  }
};

// Cancel email sender
export const sendOrderCancelEmail = async (
  order,
  customerEmail,
  customerName,
  imageurl,
  restaurantName
) => {
  const orderNumber = order.orderNumber || order._id;

  const mailOptions = {
    from: `"${restaurantName || ""}" <${mailConfig.auth.user}>`,
    to: customerEmail,
    subject: `Order Cancelled - Order #${orderNumber}`,
    html: generateOrderCancelledHTML(
      order,
      customerName,
      imageurl,
      restaurantName
    ),
  };

  console.log("📨 Sending cancel email to:", customerEmail);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Cancel email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending cancel email:", error);
    throw error;
  }
};

// Generic send mail function
export const sendMail = async (to, subject, text, html) => {
  const mailOptions = {
    from: mailConfig.auth.user,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw error;
  }
};
