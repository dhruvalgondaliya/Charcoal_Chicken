import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    imageurl: {
      type: String,
      required: false,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      required: true,
    },

    bio: {
      type: String,
      default: "",
    },
    country: { type: String, required: true },
    city: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },

    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },
  },
  { timestamps: true }
);
const restaurantProfile = mongoose.model("RestaurantProfile", userSchema);

export default restaurantProfile;
