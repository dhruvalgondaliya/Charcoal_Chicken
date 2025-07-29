import mongoose from "mongoose";
import addOneSchema from "../Models/AddOne.js";

const variantSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      enum: ["Small", "Medium", "Large"],
      required: false,
    },
    price: {
      type: Number,
      required: true,
    },
    addOns: [addOneSchema],
  },
  {
    versionKey: false,
  }
);

export default variantSchema;
