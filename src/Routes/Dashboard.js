import express from "express";
import Auth from "../MiddleWare/Auth.js";
import {getAllNewUser,getDashboardStats,getOrdersByCategory,getOrdersStats,getPaymentMethodStats,getRestaurantSalesTrends,getRestaurantsStats,getRestaurantStats,getTopSaleItems,getRestaurantWiseSales,} from "../Controllers/Dashbord.js";

export const Dashboard_Routes = express.Router();

// Main Admin Get Api Point
Dashboard_Routes.get("/getRestaurantData", Auth, getRestaurantStats);
Dashboard_Routes.get("/new-users", Auth, getAllNewUser);
Dashboard_Routes.get("/newAndAllresto", Auth, getRestaurantsStats);
Dashboard_Routes.get("/totalOrdersAcross", Auth, getOrdersStats);
Dashboard_Routes.get("/getTopSellingRestaurants", Auth, getRestaurantWiseSales);

// Restaurant Admin Api Point
Dashboard_Routes.get("/stats/:restaurantId", Auth, getDashboardStats);
Dashboard_Routes.get(
  "/getRestaurantData/:restaurantId/sales-trends",
  Auth,
  getRestaurantSalesTrends
);
Dashboard_Routes.get(
  "/payment-method-stats/:restaurantId",
  Auth,
  getPaymentMethodStats
);
Dashboard_Routes.get("/top-selling-items/:restaurantId", Auth, getTopSaleItems);
Dashboard_Routes.get(
  "/top-selling-category/:restaurantId",
  Auth,
  getOrdersByCategory
);
