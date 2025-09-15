import nodemailer from "nodemailer";
import mailConfig from "../config/mailConfig.js";
import {
  generateOrderReceiptHTML,
  generateOrderReceiptText,
} from "../templates/orderReceiptTemplate.js";

const transporter = nodemailer.createTransport(mailConfig);

// Function to send order receipt email
export const sendOrderReceiptEmail = async (
  order,
  customerEmail,
  customerName,
  imageurl = null,
  restaurantName = null
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
