import CartSche from "../Models/Cart.js";
import FoodItems from "../Models/FoodItems.js";

export const addToCart = async (req, res) => {
  try {
    const { userId, menuItemId, variantId, addOns, quantity } = req.body;

    const menuItem = await FoodItems.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu Item not found" });
    }

    const variant = menuItem.variants.find(
      (v) => v._id.toString() === variantId
    );
    if (!variant) {
      return res.status(400).json({ message: "Variant not found" });
    }

    let totalPrice = variant.Price;
    if (addOns?.length > 0) {
      addOns.forEach((addOnId) => {
        const found = menuItem.addOns.find(
          (add) => add._id.toString() === addOnId
        );
        if (found) totalPrice += found.price;
      });
    }

    const totalAmount = totalPrice * quantity;

    // 4. Create Cart
    const cart = await CartSche.create({
      userId,
      items: [
        {
          menuItemId,
          quantity,
          variantId,
          addOns,
        },
      ],
      totalAmount,
    });

    res.status(201).json({ message: "Item added to cart", cart });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to add to cart", error: err.message });
  }
};
