import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const ReviewSche = mongoose.model("Review", ReviewSchema);

export default ReviewSche;

