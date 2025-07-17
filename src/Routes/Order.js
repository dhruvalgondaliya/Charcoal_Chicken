import express from "express";
import {
  deleteUserOrder,
  getAllOrder,
  getUserByIdOrder,
  OrderCreate,
  updateUserOrder,
} from "../Controllers/Order.js";
import Auth from "../MiddleWare/Auth.js";

export const Order_Routes = express.Router();

// Order Create Routes
Order_Routes.post("/createOrder/:userId/:restaurantId/menu/:menuItemId", Auth, OrderCreate);

// Order Get/GetById Routes
Order_Routes.get("/getAllOrder", Auth, getAllOrder);
Order_Routes.get("/userOrder/:id", Auth, getUserByIdOrder);

// Order Edit/Delete Routes
Order_Routes.put("/update/:userId/:OrderId", Auth, updateUserOrder);
Order_Routes.delete("/delete/:userId/:OrderId", Auth, deleteUserOrder);
