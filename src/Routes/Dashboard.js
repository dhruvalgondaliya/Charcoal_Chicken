import express from "express";
import Auth from "../MiddleWare/Auth.js";
import {
  getDashboardStats,
  getOrdersByCategory,
  getPaymentMethodStats,
  getRestaurantSalesTrends,
  getRestaurantStats,
  getTopSaleItems,
} from "../Controllers/Dashbord.js";

export const Dashboard_Routes = express.Router();

// Main Admin Get Api Point
Dashboard_Routes.get("/getRestaurantData", Auth, getRestaurantStats);

// Restaurant Admin Api Point
Dashboard_Routes.get("/stats", Auth, getDashboardStats);
Dashboard_Routes.get(
  "/getRestaurantData/:restaurantId/sales-trends",
  Auth,
  getRestaurantSalesTrends
);
Dashboard_Routes.get("/payment-method-stats/:restaurantId", Auth, getPaymentMethodStats);
Dashboard_Routes.get("/top-selling-items/:restaurantId", Auth, getTopSaleItems);
Dashboard_Routes.get("/top-selling-category/:restaurantId", Auth, getOrdersByCategory);
