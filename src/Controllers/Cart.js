import CartSche from "../Models/Cart.js";
import FoodItems from "../Models/FoodItems.js";

// Create Cart
export const addToCart = async (req, res) => {
  const { userId, menuItemId } = req.params;
  const { variantId, quantity, addOns } = req.body;

  try {
    // Find the menu item in DB
    const menuItem = await FoodItems.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    let selectedVariant = null;

    //If the item has variants
    if (menuItem.variants && menuItem.variants.length > 0) {
      if (!variantId) {
        return res
          .status(400)
          .json({ message: "Variant ID is required for this item" });
      }

      const variant = menuItem.variants.find(
        (v) => v._id.toString() === variantId
      );

      if (!variant) {
        return res.status(400).json({ message: "Variant not found" });
      }

      selectedVariant = { size: variant.size, price: variant.price };
    }
    // If the item has no variants, use base price
    else {
      selectedVariant = { size: null, price: menuItem.price };
    }

    // Calculate total price (item price + add-ons)
    let totalPrice = selectedVariant.price;
    if (addOns && addOns.length > 0) {
      const validAddOns = menuItem.addOns.filter((a) =>
        addOns.includes(a._id.toString())
      );
      validAddOns.forEach((a) => {
        totalPrice += a.price;
      });
    }

    // Multiply by quantity
    totalPrice *= quantity;

    // Add to cart
    const cart = await CartSche.findOneAndUpdate(
      { userId },
      {
        $push: {
          items: {
            menuItemId,
            variant: selectedVariant,
            quantity,
            addOns,
            price: totalPrice,
          },
        },
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "Item added to cart", cart });
  } catch (error) {
    console.error("Add to cart error:", error);
    res
      .status(500)
      .json({ message: "Failed to add to cart", error: error.message });
  }
};

// Fetch Cart By UserId
export const fetchCartByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const Cart = await CartSche.find({ userId }).populate({
      path: "items.menuItemId",
      select: "name description imageUrl",
    });

    if (!Cart || Cart.length === 0) {
      return res.status(404).json({
        message: "No cart items found for the user",
      });
    }

    res.status(200).json({
      message: "Cart Fetched successfully",
      totalCartData: Cart.length,
      data: Cart,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch cart",
      error: error.message,
    });
  }
};

// Edit Cart
export const updateCartItem = async (req, res) => {
  const { userId, cartItemId } = req.params;
  const { quantityChange } = req.body;

  try {
    const cart = await CartSche.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === cartItemId
    );

    if (itemIndex === -1)
      return res.status(404).json({ message: "Cart item not found" });

    // Update quantity
    cart.items[itemIndex].quantity += quantityChange;

    // Remove if quantity <= 0
    if (cart.items[itemIndex].quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      const item = cart.items[itemIndex];

      // Fix: Ensure variant.size is NEVER null or undefined (use "default" if missing)
      if (!item.variant || !item.variant.size) {
        item.variant = item.variant || {};
        item.variant.size = "default";
      }

      // Recalculate item price

      // Get menu item data to calculate addOns price
      const menuItem = await FoodItems.findById(item.menuItemId);
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }

      let addOnsPrice = 0;
      if (item.addOns && item.addOns.length > 0) {
        // Match addOns with menuItem addOns to get prices
        const validAddOns = menuItem.addOns.filter((a) =>
          item.addOns.includes(a._id.toString())
        );
        addOnsPrice = validAddOns.reduce((sum, a) => sum + a.price, 0);
      }

      // Make sure variant.price is a number
      const variantPrice =
        typeof item.variant.price === "number" ? item.variant.price : 0;

      item.price = (variantPrice + addOnsPrice) * item.quantity;
    }

    // Recalculate cart totalAmount and subTotal safely (no NaN)
    cart.subTotal = cart.items.reduce((sum, item) => {
      return sum + (typeof item.price === "number" ? item.price : 0);
    }, 0);

    cart.totalAmount = cart.subTotal; // Or add taxes/fees here if needed

    // Validate subTotal and totalAmount exist in schema or remove required if not needed

    await cart.save();

    res.status(200).json({ message: "Cart updated", cart });
  } catch (error) {
    console.error("Update cart item error:", error);
    res
      .status(500)
      .json({ message: "Failed to update cart", error: error.message });
  }
};

// Delete Cart
export const deleteCartItem = async (req, res) => {
  const { cartId, menuItemId } = req.params;

  try {
    const cart = await CartSche.findById(cartId);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Filter out the item(s) with the matching menuItemId
    const originalItemCount = cart.items.length;

    cart.items = cart.items.filter(
      (item) => item.menuItemId.toString() !== menuItemId
    );

    if (cart.items.length === originalItemCount) {
      return res.status(404).json({ message: "Menu item not found in cart" });
    }

    // Recalculate totalAmount and subTotal after removal
    cart.subTotal = cart.items.reduce(
      (sum, item) => sum + (typeof item.price === "number" ? item.price : 0),
      0
    );

    cart.totalAmount = cart.subTotal;

    await cart.save();

    res.status(200).json({
      message: "Item removed from cart successfully",
      cart,
    });
  } catch (error) {
    console.error("Delete cart item error:", error);
    res.status(500).json({
      message: "Failed to delete cart item",
      error: error.message,
    });
  }
};
