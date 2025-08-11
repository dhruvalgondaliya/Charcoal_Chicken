import mongoose from "mongoose";

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
    size: { type: String, required: true },
    price: { type: Number, required: true },
  },
  addOns: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
    },
  ],
});

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [CartItemSchema],
    subTotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: { type: String, default: null },
    totalAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

const CartSche = mongoose.model("Cart", CartSchema);

export default CartSche;
