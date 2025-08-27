import express from "express";
import {
  getAllUser,
  loginUser,
  updateUser,
  userGetById,
  UserRegistration,
  deleteUser,
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
