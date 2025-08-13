import express from "express";
import {
  createOrder,
  deleteUserOrder,
  getAllOrder,
  getRestaurantOrders,
  getUserByIdOrder,
  updateOrderAndPaymentStatus,
  updateUserOrder,
} from "../Controllers/Order.js";
import Auth from "../MiddleWare/Auth.js";

export const Order_Routes = express.Router();

// Order Create Routes
Order_Routes.post("/createOrder/:userId/:cartId", Auth, createOrder);

// Order Get/GetById Routes
Order_Routes.get("/getAllOrder", Auth, getAllOrder);
Order_Routes.get("/userOrder/:userId", Auth, getUserByIdOrder);
Order_Routes.get("/restaurantOrders/:restaurantId", Auth, getRestaurantOrders);

// Order Edit/Delete Routes
Order_Routes.put("/update-status/:orderId", Auth, updateOrderAndPaymentStatus);
Order_Routes.put("/update-order/:userId/:OrderId", Auth, updateUserOrder);
Order_Routes.delete("/delete/:userId/:OrderId", Auth, deleteUserOrder);
