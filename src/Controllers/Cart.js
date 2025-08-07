import CartSche from "../Models/Cart.js";
import FoodItems from "../Models/FoodItems.js";

// Create Cart
import CartSche from "../Models/Cart.js";
import FoodItems from "../Models/FoodItems.js";

// Add item to cart
export const addToCart = async (req, res) => {
  const { userId, menuItemId } = req.params;
  const { variantId, quantity, addOns } = req.body;

  try {
    // Find the menu item
    const menuItem = await FoodItems.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // Find the selected variant
    const variant = menuItem.variants.find(
      (v) => v._id.toString() === variantId
    );
    if (!variant) {
      return res.status(400).json({ message: "Variant not found" });
    }

    // Prepare selected variant
    const selectedVariant = {
      size: variant.size,
      price: variant.Price,
    };

    // Find selected add-ons (if any)
    const selectedAddOns = Array.isArray(addOns)
      ? addOns
          .map((addOnId) => {
            const addOn = menuItem.addOns.find(
              (a) => a._id.toString() === addOnId
            );
            return addOn ? { name: addOn.name, price: addOn.price } : null;
          })
          .filter((addOn) => addOn !== null)
      : [];

    // Calculate total for this item
    const variantTotal = variant.Price * quantity;
    const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
    const totalAmount = variantTotal + addOnsTotal;

    // Check if cart exists for user
    let cart = await CartSche.findOne({ userId });

    // If no cart, create new
    if (!cart) {
      cart = new CartSche({
        userId,
        items: [],
        totalAmount: 0,
      });
    }

    // Check if this item with same variant and addons already exists in cart
    const existingItemIndex = cart.items.findIndex((item) => {
      return (
        item.menuItemId.toString() === menuItemId &&
        item.variant.size === selectedVariant.size &&
        JSON.stringify(item.addOns) === JSON.stringify(selectedAddOns)
      );
    });

    if (existingItemIndex !== -1) {
      // If item exists, increase quantity and recalculate
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // If item doesn't exist, push new
      cart.items.push({
        menuItemId,
        quantity,
        variant: selectedVariant,
        addOns: selectedAddOns,
      });
    }

    // Recalculate total cart amount
    let newTotal = 0;
    for (const item of cart.items) {
      const itemTotal =
        item.variant.price * item.quantity +
        item.addOns.reduce((sum, a) => sum + a.price, 0);
      newTotal += itemTotal;
    }

    cart.totalAmount = newTotal;

    await cart.save();

    return res.status(201).json({
      message: "Item added to cart successfully",
      data: cart,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to add to cart",
      error: err.message,
    });
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
export const editCartItem = async (req, res) => {
  const { userId, menuItemId } = req.params;
  const { variantId, quantity, addOns } = req.body;

  try {
    const menuItem = await FoodItems.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // Find variant
    const variant = menuItem.variants.find(
      (v) => v._id.toString() === variantId
    );
    if (!variant) {
      return res.status(400).json({ message: "Variant not found" });
    }

    const selectedVariant = {
      size: variant.size,
      price: variant.Price,
    };

    // Find addOns
    const selectedAddOns = Array.isArray(addOns)
      ? addOns.map((addOnId) => {
          const addOn = menuItem.addOns.find(
            (a) => a._id.toString() === addOnId
          );
          return addOn ? { name: addOn.name, price: addOn.price } : null;
        })
      : [];

    const variantTotal = variant.Price * quantity;
    const addOnsTotal = selectedAddOns.reduce(
      (sum, addOn) => sum + (addOn?.price || 0),
      0
    );
    const totalAmount = variantTotal + addOnsTotal;

    // Find existing cart
    const cart = await CartSche.findOne({ userId });

    console.log("Received userId in params:", req.params.userId);

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find item to update
    const itemIndex = cart.items.findIndex(
      (item) => item.menuItemId.toString() === menuItemId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Update item
    cart.items[itemIndex] = {
      menuItemId,
      quantity,
      variant: selectedVariant,
      addOns: selectedAddOns,
    };

    // Recalculate totalAmount
    let newTotal = 0;
    for (let item of cart.items) {
      const itemTotal =
        item.variant.price * item.quantity +
        item.addOns.reduce((sum, a) => sum + (a?.price || 0), 0);
      newTotal += itemTotal;
    }

    cart.totalAmount = newTotal;

    await cart.save();

    res.status(200).json({
      message: "Cart item updated successfully",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update cart item",
      error: error.message,
    });
  }
};

// Delete Cart
export const cartDelete = async (req, res) => {
  const { cartId } = req.params;
  try {
    const cart = await CartSche.findByIdAndDelete(cartId);

    if (!cart) {
      return res.status(404).json({ message: "Cart Not Found" });
    }

    res.status(200).json({
      message: "Cart Delete SuccessFully",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to Delete cart",
      error: error.message,
    });
  }
};
