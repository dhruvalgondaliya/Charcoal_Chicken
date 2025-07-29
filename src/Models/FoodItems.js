import mongoose from "mongoose";
import variantSchema from "../Models/Variant.js";
import addOneSchema from "./AddOne.js";

const foodItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },

    hasVariants: {
      type: Boolean,
      default: false,
    },

    price: {
      type: Number,
      required: function () {
        return !this.hasVariants;
      },
    },

    variants: {
      type: [variantSchema],
      required: function () {
        return this.hasVariants;
      },
    },

    addOns: {
      type: [addOneSchema],
      default: [],
    },
  },
  { versionKey: false }
);

const foodItemSch = mongoose.model("FoodItems", foodItemSchema);
export default foodItemSch;
