import mongoose from "mongoose";

const CartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  items: [
    {
      menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "FoodItems" },
      price: { type: Number },
      quantity: { type: Number },
      addOn: [
        {
          name: String,
          price: Number,
        },
      ],
    },
  ],
});

const CartSche = mongoose.model("Cart", CartSchema);

export default CartSche;
