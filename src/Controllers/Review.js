import restaurant from "../Models/Restaurant.js";
import ReviewSche from "../Models/Review.js";
import OrderSche from "../Models/OrderSch.js";
import mongoose from "mongoose";

export const createReview = async (req, res) => {
  const { userId, restaurantId, orderId } = req.params;
  console.log("Review Params:", { userId, restaurantId, orderId });

  const { rating, comment } = req.body;

  if (!rating || !comment) {
    return res.status(400).json({
      success: false,
      message: "Rating and comment are required.",
    });
  }

  try {
    const normalizedRestaurantId = mongoose.Types.ObjectId.isValid(restaurantId)
      ? new mongoose.Types.ObjectId(restaurantId)
      : restaurantId;

    //Check if order exists and belongs to the user
    const order = await OrderSche.findOne({
      _id: orderId,
      userId,
      restaurantId: normalizedRestaurantId,
    });

    if (!order) {
      return res.status(400).json({
        success: false,
        message: "You can only review after placing a valid order.",
      });
    }

    //Check if user already reviewed this order
    const existingReview = await ReviewSche.findOne({
      userId,
      orderId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a review for this order.",
      });
    }

    // Create new review
    const review = await ReviewSche.create({
      userId,
      restaurantId,
      orderId,
      rating,
      comment,
    });

    // Push review ID to Restaurant document
    await restaurant.findByIdAndUpdate(restaurantId, {
      $push: { reviews: review._id },
    });

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create review",
      error: error.message,
    });
  }
};

// Get Review All
export const getUserReview = async (req, res) => {
  try {
    const review = await ReviewSche.find()
      .populate("userId", "userName Email")
      .populate("restaurantId", "name address");

    if (!review || review.length === 0) {
      return res
        .status(404)
        .json({ messages: "No review Found for this Restaurant" });
    }

    res.status(200).json({
      message: "Review Fetch SuccessFully",
      totalReview: review.length,
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get review",
      error: error.message,
    });
  }
};

// Get Review By Id
export const getReviewsByRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const reviews = await ReviewSche.find({ restaurantId: id })
      .populate("userId", "userName Email")
      .populate("restaurantId", "name address");

    if (!reviews || reviews.length === 0) {
      return res.status(404).json({
        message: "No reviews found for this restaurant",
        averageRating: 0,
      });
    }

    // calculate average rating
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = (totalRating / reviews.length).toFixed(1); 

    res.status(200).json({
      message: "Fetched reviews successfully",
      totalReview: reviews.length,
      averageRating, 
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch reviews for Restaurant",
      error: error.message,
    });
  }
};

// Edit Review by user
export const EditReviewByUser = async (req, res) => {
  const { userId, restaurantId } = req.params;

  try {
    const updatedReview = await ReviewSche.findOneAndUpdate(
      { userId, restaurantId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedReview) {
      return res.status(404).json({
        message: "Review not found for this user and restaurant",
      });
    }

    res.status(200).json({
      message: "Review updated successfully",
      data: updatedReview,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update review",
      error: error.message,
    });
  }
};

// Delete RestaurantReview by user
export const deleteRestaurantReview = async (req, res) => {
  const { userId, restaurantId } = req.params;

  try {
    const review = await ReviewSche.findOneAndDelete({ userId, restaurantId });

    if (!review) {
      return res.status(404).json({
        message: "Review not found for this user and restaurant",
      });
    }

    // Find Review and update in Restaurant
    await restaurant.findByIdAndUpdate(review.restaurantId, {
      $pull: { reviews: review._id },
    });

    res.status(200).json({
      message: "Review deleted successfully",
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete review",
      error: error.message,
    });
  }
};
