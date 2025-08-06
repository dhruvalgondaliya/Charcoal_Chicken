import express from "express";
import { CreateProfile, getUserProfiles, updateUserProfile } from "../Controllers/UserProfiles.js";
import upload from "../MiddleWare/Multer.js";

export const UserProfile_Routes = express.Router();

// Create
UserProfile_Routes.post("/restaurant/:restaurantId/user-profile", upload.single("imageurl"), CreateProfile);

UserProfile_Routes.get("/restaurant/user-profile/:restaurantId", getUserProfiles);

UserProfile_Routes.put("/restaurant/user-profile/:profileId", upload.single("imageurl"), updateUserProfile);

  