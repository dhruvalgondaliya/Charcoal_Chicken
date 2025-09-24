import express from "express";
import { CreateProfile, getUserProfiles, updateUserProfile } from "../Controllers/RestaurantProfiles.js";
import upload from "../MiddleWare/Multer.js";

export const RestaurantProfile_Routes = express.Router();

// Create / get / put api  
RestaurantProfile_Routes.post("/restaurant/:restaurantId/user-profile", upload.single("imageurl"), CreateProfile);

RestaurantProfile_Routes.get("/restaurant/user-profile/:restaurantId", getUserProfiles);

RestaurantProfile_Routes.put("/restaurant/user-profile/:profileId", upload.single("imageurl"), updateUserProfile);
