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
    country: { type: String, required: true },
    city: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
const UserProSch = mongoose.model("UserProfile", userSchema);

export default UserProSch;
