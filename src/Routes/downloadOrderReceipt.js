import express from "express";
import { getOrderReceipt } from "../Controllers/downloadOrderReceipt.js";

export const OrderReceipte_Routes = express.Router();

OrderReceipte_Routes.get("/order/:orderId/downloadReceipte", getOrderReceipt);