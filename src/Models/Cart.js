import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FoodItems",
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  variant: {
    size: { type: String, required: false },
    price: { type: Number, required: true },
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "Variant" }
  },
  addOns: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "AddOn" }, // Reference to AddOn model
      name: { type: String, required: true }, // Optional: for display purposes
      price: { type: Number, required: true } // Store price for quick access
    }
  ],
  price: { type: Number, required: true }, // Pre-tax price (base price + add-ons) * quantity
  tax: { type: Number, required: true } // Tax amount for this item
});

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    items: [CartItemSchema],
    subTotal: { type: Number, default: 0 }, // Total before tax and delivery
    taxAmount: { type: Number, default: 0 }, // Total tax for all items
    deliveryCharge: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: { type: String, default: null },
    totalAmount: { type: Number, required: true, default: 0 } // Final amount after tax, delivery, and discount
  },
  {
    versionKey: false,
    timestamps: true
  }
);

const CartSche = mongoose.model("Cart", CartSchema);

export default CartSche;
