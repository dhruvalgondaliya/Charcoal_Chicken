import express from "express";
import {
  getAllUser,
  loginUser,
  updateUser,
  userGetById,
  UserRegistration,
  deleteUser,
  otpSendApi,
  verifyOtpApi,
  newPasswordApi,
} from "../Controllers/User.js";
import Auth from "../MiddleWare/Auth.js";

export const User_Routes = express.Router();

// Post Routes
User_Routes.post("/register", UserRegistration);
User_Routes.post("/login", loginUser);

// Get Routes
User_Routes.get("/getAllUser", Auth, getAllUser);
User_Routes.get("/getAllUser/:id", userGetById);

// Edit/Delete Routes
User_Routes.put("/updateUser/:id", Auth, updateUser);
User_Routes.delete("/delete/:id", Auth, deleteUser);

// Otp Api Routes
User_Routes.post("/send-otp", otpSendApi);
User_Routes.post("/verify-otp", verifyOtpApi);
User_Routes.post("/forgot-password/new-password", newPasswordApi);
