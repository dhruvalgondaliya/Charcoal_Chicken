import CartSche from "../Models/Cart.js";
import FoodItems from "../Models/FoodItems.js";

// Create Cart
export const addToCart = async (req, res) => {
  const { userId, menuItemId } = req.params;

  try {
    const { variantId, quantity, addOns } = req.body;

    const menuItem = await FoodItems.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu Item not found" });
    }

    const variant = menuItem.variants.find(
      (v) => v._id.toString() === variantId
    );

    // Get Variant Name & price
    const selectedVariant = {
      size: variant.size,
      price: variant.Price,
    };

    if (!variant) {
      return res.status(400).json({ message: "Variant not found" });
    }

    //extra items get logic
    const selectedAddOns = addOns.map((addOnId) => {
      const addOn = menuItem.addOns.find((a) => a._id.toString() === addOnId);
      return addOn ? { name: addOn.name, price: addOn.price } : null;
    });

    // Auto totalAmount
    const variantTotal = variant.Price * quantity;
    const addOnsTotal = selectedAddOns.reduce(
      (sum, addOn) => sum + addOn.price,
      0
    );
    const totalAmount = variantTotal + addOnsTotal;

    const cart = await CartSche.create({
      userId,
      items: [
        {
          menuItemId,
          quantity,
          variant: selectedVariant,
          addOns: selectedAddOns,
        },
      ],
      totalAmount,
    });

    res.status(201).json({
      message: "Item add to cart successfully",
      data: cart,
    });
  } catch (err) {
    res.status(500).json({
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
