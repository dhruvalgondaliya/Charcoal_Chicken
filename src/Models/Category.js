import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FoodItems",
      },
    ],
  },
  {
    versionKey: false,
  }
);

const CategorySch = mongoose.model("Category", categorySchema);

export default CategorySch;
