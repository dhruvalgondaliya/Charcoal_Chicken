import mongoose from "mongoose";
import addOnSchema from "../Models/AddOne.js";

const variantSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      enum: ["Small", "Medium", "Large"],
      required: false,
    },
    Price: {
      type: Number,
      required: true,
    },
    addOns: [addOnSchema],
  },
  {
    versionKey: false,
  },
  { _id: false }
);

export default variantSchema;
