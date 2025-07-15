import mongoose from "mongoose";

const addOnSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, default: 0 },
  },
  {
    versionKey: false,
  }
);

export default addOnSchema;
