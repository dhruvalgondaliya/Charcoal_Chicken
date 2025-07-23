import express from "express";
import {
  addToCart,
  cartDelete,
  fetchCartByUserId,

} from "../Controllers/Cart.js";
import Auth from "../MiddleWare/Auth.js";

export const Cart_Routes = express.Router();

// Post Routes
Cart_Routes.post("/createCart/:userId/menu/:menuItemId", Auth, addToCart);

// Fetch Cart Routes By Id
Cart_Routes.get("/fetch/:userId", Auth, fetchCartByUserId);

// Edit/Delete Routes
Cart_Routes.delete("/delete-cart/:cartId", Auth, cartDelete);
