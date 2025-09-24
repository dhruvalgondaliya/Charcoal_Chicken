import express from "express";
import upload from "../MiddleWare/Multer.js";
import { CreateUserProfile, getUserProfiles, updateUserProfile } from "../Controllers/UserProfile.js";

export const UserProfile_Routes = express.Router();

// Create / get / put api  
UserProfile_Routes.post("/user/:userId", upload.single("imageurl"), CreateUserProfile);

UserProfile_Routes.get("/user-profile/:userId", getUserProfiles);

UserProfile_Routes.put("/user-profile/:profileId", upload.single("imageurl"), updateUserProfile);
