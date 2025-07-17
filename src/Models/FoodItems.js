import mongoose from "mongoose";
import variantSchema from "../Models/Variant.js";

const foodItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: String,

    hasVariants: {
      type: Boolean,
      default: false,
    },

    basePrice: {
      type: Number,
      required: function () {
        return !this.hasVariants;
      },
    },

    RegularPrice: {
      type: Number,
      required: true,
    },

    variants: {
      type: [variantSchema],
      required: function () {
        return this.hasVariants;
      },
    },
  },
  {
    versionKey: false,
  }
);

const foodItemSch = mongoose.model("FoodItems", foodItemSchema);
export default foodItemSch;
