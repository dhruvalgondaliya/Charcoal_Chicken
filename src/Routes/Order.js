import express from "express";
import {
  deleteUserOrder,
  getAllOrder,
  getUserByIdOrder,
  OrderCreate,
  updateUserOrder,
} from "../Controllers/Order.js";

export const Order_Routes = express.Router();

// Order Create Routes
Order_Routes.post("/createOrder/:userId/:restaurantId", OrderCreate);

// Order Get/GetById Routes
Order_Routes.get("/getAllOrder", getAllOrder);
Order_Routes.get("/userOrder/:id", getUserByIdOrder);

// Order Edit/Delete Routes
Order_Routes.put("/update/:userId/:OrderId", updateUserOrder);
Order_Routes.delete("/delete/:userId/:OrderId", deleteUserOrder);
