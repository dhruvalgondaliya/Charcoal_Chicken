import express from "express";
import {
  createReview,
  deleteRestaurantReview,
  EditReviewByUser,
  getReviewsByRestaurant,
  getUserReview,
} from "../Controllers/Review.js";
import Auth from "../MiddleWare/Auth.js";

export const Review_Routes = express.Router();

// Create Routes
Review_Routes.post("/create/:userId/:restaurantId", Auth, createReview);

// Get Routes
Review_Routes.get("/restorunt/getAllReview", Auth, getUserReview);
Review_Routes.get("/restorunt/:id", Auth, getReviewsByRestaurant);

// Edit / Delete Routes
Review_Routes.put("/:userId/restorunt/:restaurantId", Auth, EditReviewByUser);
Review_Routes.delete(
  "/:userId/restorunt/:restaurantId",
  Auth,
  deleteRestaurantReview
);
