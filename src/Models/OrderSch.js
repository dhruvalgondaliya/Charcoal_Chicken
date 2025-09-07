import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    cartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
      required: true,
    },
    items: [
      {
        menuItemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "FoodItems",
          required: true,
        },
        name: String,
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        variant: {
          size: String,
          price: Number,
        },
        addOns: [
          {
            name: String,
            price: Number,
          },
        ],
      },
    ],
    subTotal: { type: Number, required: true },
    taxAmount: { type: Number, required: true },
    deliveryCharge: { type: Number, required: true },
    totalAmount: { type: Number, required: true },

    deliveryAddress: {
      FullName: { type: String, required: true },
      PhoneNumber: { type: String, required: true },
      Address: { type: String, required: true },
      City: { type: String, required: true },
      ZIPCode: { type: String, required: true },
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "out-for-delivery",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "card", "Razorpay"],
      default: "cod",
      required: true,
    },
  },
  { timestamps: true }
);

const OrderSche = mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default OrderSche;
