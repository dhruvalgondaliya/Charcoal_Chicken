import mongoose from "mongoose";
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
  },
  {
    versionKey: false,
  }
);

export default variantSchema;
