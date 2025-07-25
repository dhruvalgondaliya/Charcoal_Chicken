import express from "express";
import {
  createRestaurant,
  deleteRestaurant,
  getAllRestaurunt,
  RestoFindById,
  updateRestaurant,
  loginRestaurant,
} from "../Controllers/Restaurant.js";
import Auth from "../MiddleWare/Auth.js";
import upload from "../MiddleWare/Multer.js";

export const Restorant_Routes = express.Router();

// create Routes
Restorant_Routes.post(
  "/createRestorant",
  upload.single("image"),
  Auth,
  createRestaurant
);
Restorant_Routes.post("/loginRestorant",loginRestaurant);

// Get Routes
Restorant_Routes.get("/getAllRestaurunt", Auth, getAllRestaurunt);
Restorant_Routes.get("/:id", Auth, RestoFindById);

// Edit/Delete Route
Restorant_Routes.put("/update/:id", Auth, updateRestaurant);
Restorant_Routes.delete("/delete/:id", Auth, deleteRestaurant);
