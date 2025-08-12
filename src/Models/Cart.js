import mongoose from "mongoose";

// Cart Item Schema
const CartItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FoodItems",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  variant: {
    size: { type: String, required: false },
    price: { type: Number, required: true },
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "Variant" },
  },
  addOns: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "AddOn" },
      name: { type: String, required: true },
      price: { type: Number, required: true },
    },
  ],
  price: { type: Number, required: true },
  tax: { type: Number, required: true },
});

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [CartItemSchema],
    subTotal: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    taxAmount: { type: Number, required: true },
    // discount: { type: Number, default: 0 },
    // couponCode: { type: String, default: null },
    totalAmount: { type: Number, required: true, default: 0 },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const CartSche = mongoose.model("Cart", CartSchema);

export default CartSche;
