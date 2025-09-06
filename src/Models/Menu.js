import mongoose from "mongoose";

const menuSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Menu = mongoose.models.Menu || mongoose.model("Menu", menuSchema);

export default Menu;
