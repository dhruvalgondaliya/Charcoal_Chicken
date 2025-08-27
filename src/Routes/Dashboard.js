import express from "express";
import Auth from "../MiddleWare/Auth.js";
import {
  getDashboardStats,
  getRestaurantSalesTrends,
  getRestaurantStats,
} from "../Controllers/Dashbord.js";

export const Dashboard_Routes = express.Router();

// Main Admin Get Api Point
Dashboard_Routes.get("/getRestaurantData", Auth, getRestaurantStats);



// Restaurant Admin Api Point
Dashboard_Routes.get("/stats", Auth, getDashboardStats);
Dashboard_Routes.get("/getRestaurantData/:restaurantId/sales-trends",Auth, getRestaurantSalesTrends);
