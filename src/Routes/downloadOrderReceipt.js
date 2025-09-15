import express from "express";
import { getOrderReceipt } from "../Controllers/downloadOrderReceipt.js";
import rateLimit from "express-rate-limit";

// Limit to 3 requests per 2 minutes per IP
const receiptLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, 
  max: 3,
  message: {
    success: false,
    message: "Too many download attempts. Try again later.",
  },
});

export const OrderReceipte_Routes = express.Router();

OrderReceipte_Routes.get(
  "/order/:orderId/downloadReceipte",
  receiptLimiter,
  getOrderReceipt
);
