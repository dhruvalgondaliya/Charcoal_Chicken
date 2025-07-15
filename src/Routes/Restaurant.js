import express from "express";
import {
  createRestaurant,
  deleteRestaurant,
  getAllRestaurunt,
  RestoFindById,
  updateRestaurant,
} from "../Controllers/Restaurant.js";

export const Restorant_Routes = express.Router();

// create Routes
Restorant_Routes.post("/createRestorant", createRestaurant);

// Get Routes
Restorant_Routes.get("/getAllRestaurunt", getAllRestaurunt);
Restorant_Routes.get("/:id", RestoFindById);

// Edit/Delete Route
Restorant_Routes.put("/update/:id", updateRestaurant);
Restorant_Routes.delete("/delete/:id", deleteRestaurant);
