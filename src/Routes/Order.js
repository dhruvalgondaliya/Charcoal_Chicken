import express from "express";
import {
  deleteUserOrder,
  getAllOrder,
  getUserByIdOrder,
  OrderCreate,
  updateOrderAndPaymentStatus,
  updateUserOrder,
} from "../Controllers/Order.js";
import Auth from "../MiddleWare/Auth.js";

export const Order_Routes = express.Router();

// Order Create Routes
Order_Routes.post("/createOrder/:userId/:menuItemId", Auth, OrderCreate);

// Order Get/GetById Routes
Order_Routes.get("/getAllOrder", Auth, getAllOrder);
Order_Routes.get("/userOrder/:id", Auth, getUserByIdOrder);

// Order Edit/Delete Routes
Order_Routes.put("/update-status/:orderId", Auth, updateOrderAndPaymentStatus);
Order_Routes.put("/update-order/:userId/:OrderId", Auth, updateUserOrder);
Order_Routes.delete("/delete/:userId/:OrderId", Auth, deleteUserOrder);
