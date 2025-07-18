import express from "express";
import Auth from "../MiddleWare/Auth.js";
import { addToCart } from "../Controllers/Cart.js";

export const Cart_Routes = express.Router();

Cart_Routes.post("/createCart/:userId", Auth, addToCart);
