import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },

    Email: {
      type: String,
      required: true,
    },

    Password: {
      type: String,
      required: true,
    },

    MobileNo: {
      type: Number,
      required: true,
    },

    DeliveryAddress: {
      type: String,
      required: true,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },

    DietaryPreferences: {
      type: String,
      enum: ["vegiterian", "nonVegiterian"],
      default: "vegiterian",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const User = mongoose.model("User", UserSchema);

export default User;
