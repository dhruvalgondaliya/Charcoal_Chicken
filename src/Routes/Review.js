import express from "express";
import {
  createReview,
  deleteRestaurantReview,
  EditReviewByUser,
  getReviewsByRestaurant,
  getUserReview,
} from "../Controllers/Review.js";

export const Review_Routes = express.Router();

// Create Routes
Review_Routes.post("/createReview/:userId/:restaurantId", createReview);

// Get Routes
Review_Routes.get("/restorunt/getAllReview", getUserReview);
Review_Routes.get("/restorunt/:id", getReviewsByRestaurant);

// Edit / Delete Routes
Review_Routes.put("/:userId/restorunt/:restaurantId", EditReviewByUser);
Review_Routes.delete("/:userId/restorunt/:restaurantId", deleteRestaurantReview);

