import express from "express";
import {
  createRestaurant,
  deleteRestaurant,
  getAllRestaurunt,
  RestoFindById,
  updateRestaurant,
} from "../Controllers/Restaurant.js";
import Auth from "../MiddleWare/Auth.js";

export const Restorant_Routes = express.Router();

// create Routes
Restorant_Routes.post("/createRestorant",Auth, createRestaurant);

// Get Routes
Restorant_Routes.get("/getAllRestaurunt",Auth, getAllRestaurunt);
Restorant_Routes.get("/:id",Auth, RestoFindById);

// Edit/Delete Route
Restorant_Routes.put("/update/:id",Auth, updateRestaurant);
Restorant_Routes.delete("/delete/:id",Auth, deleteRestaurant);
