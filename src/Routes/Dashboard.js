import express from "express";
import Auth from "../MiddleWare/Auth.js";
import {
  getDashboardStats,
  getRestaurantStats,
} from "../Controllers/Dashbord.js";

export const Dashboard_Routes = express.Router();

Dashboard_Routes.get("/stats", Auth, getDashboardStats);
Dashboard_Routes.get("/getRestaurantData",Auth, getRestaurantStats);
