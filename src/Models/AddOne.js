import mongoose from "mongoose";

const addOneSchema = new mongoose.Schema(
  {
    image: { type: String },
    name: { type: String, required: true },
    price: { type: Number, default: 0 },
  },
  {
    versionKey: false,
  }
);

export default addOneSchema;
