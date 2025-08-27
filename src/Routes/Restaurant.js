import express from "express";
import {
  createRestaurant,
  // deleteRestaurant,
  // getAllRestaurunt,
  RestoFindById,
  updateRestaurant,
  loginRestaurant,
  getAllRestaurants,
  approveRestaurant,
  rejectRestaurant,
  getnotification,
  markAsNotified,
} from "../Controllers/Restaurant.js";
import Auth from "../MiddleWare/Auth.js";
import upload from "../MiddleWare/Multer.js";
// import upload from "../MiddleWare/Multer.js";

export const Restorant_Routes = express.Router();

// create Routes
Restorant_Routes.post("/createRestaurunt", upload.single("imageUrl"), createRestaurant);
Restorant_Routes.post("/loginRestaurunt", loginRestaurant);

// Get Routes
// Restorant_Routes.get("/getAllRestaurunt", Auth, getAllRestaurunt);
Restorant_Routes.get("/getAllRestauruntByAdmin", Auth, getAllRestaurants);
Restorant_Routes.get("/getNotification", Auth, getnotification); // notification api
Restorant_Routes.get("/:id", Auth, RestoFindById);

// Edit/Delete Route
Restorant_Routes.put("/notifications/:id/mark-notified", Auth, markAsNotified);
Restorant_Routes.put("/update/:id", Auth, updateRestaurant);
Restorant_Routes.patch("/approve/:id", Auth, approveRestaurant);
Restorant_Routes.patch("/reject/:id", Auth, rejectRestaurant);

// Restorant_Routes.delete("/delete/:id", Auth, deleteRestaurant);
