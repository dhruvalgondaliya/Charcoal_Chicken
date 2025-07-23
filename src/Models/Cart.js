import mongoose from "mongoose";
import addOneSchema from "./AddOne.js";

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    items: [
      {
        menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "FoodItems" },
        quantity: { type: Number, default: 1 },
        variant: {
          size: { type: String },
          price: { type: Number },
        },
        addOns: {
          type: [addOneSchema],
          default: [],
        },
      },
    ],
    totalAmount: { type: Number, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const CartSche = mongoose.model("Carts", CartSchema);

export default CartSche;
