import express from "express";
import Auth from "../MiddleWare/Auth.js";
import {
  addToCart,
  updateCartItem,
  fetchCartByUserId,
  deleteCartItem,
} from "../Controllers/Cart.js";

export const Cart_Routes = express.Router();

// Post Routes
Cart_Routes.post("/createCart/:userId/menu/:menuItemId", Auth, addToCart);

// Fetch Cart Routes By Id
Cart_Routes.get("/fetch/:userId", Auth, fetchCartByUserId);

// Edit/Delete Routes
Cart_Routes.put("/update-cart/:userId/:cartItemId", Auth, updateCartItem);
Cart_Routes.delete("/delete-cart/:cartId/:menuItemId", Auth, deleteCartItem);
