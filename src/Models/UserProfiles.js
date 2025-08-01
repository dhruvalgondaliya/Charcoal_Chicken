import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    imageurl: {
      type: String,
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

    socialLinks: {
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      instagram: { type: String, default: "" },
    },

    address: {
      country: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      taxId: { type: String, required: true },
    },

    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },
  },
  { timestamps: true }
);
const UserProSch = mongoose.model("UserProfiles", userSchema);

export default UserProSch;
