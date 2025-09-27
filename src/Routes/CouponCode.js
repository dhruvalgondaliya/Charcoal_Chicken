import express from "express";
import {
  createCoupon,
  deleteCoupon,
  getCoupons,
  updateCoupon,
} from "../Controllers/CouponCode.js";
import Auth from "../MiddleWare/Auth.js";

export const Coupon_Route = express.Router();

// Coupon Route
Coupon_Route.get("/fetchAll/:restaurantId", Auth, getCoupons);
Coupon_Route.post("/:restaurantId", Auth, createCoupon);
Coupon_Route.put("/update/:restaurantId/:couponId", Auth, updateCoupon);
Coupon_Route.delete("/delete/:restaurantId/:couponId", Auth, deleteCoupon);
