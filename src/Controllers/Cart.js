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

    // Add 5% tax
    const taxRate = 0.05;
    const taxAmount = totalPrice * taxRate;
    totalPrice += taxAmount;

    // Round to 2 decimal places
    totalPrice = Math.round(totalPrice * 100) / 100;

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
            tax: taxAmount,
          },
        },
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "Item added to cart SuccessFully", cart });
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

    const Cart = await CartSche.findOne({ userId }).populate({
      path: "items.menuItemId",
      select: "name description imageUrl price",
    });

    if (!Cart || !Cart.items || Cart.items.length === 0) {
      return res.status(404).json({
        message: "No cart items found for the user",
      });
    }

    // Calculate totalAmount (price * quantity) and tax
    const taxRate = 0.05;
    const totalAmountBeforeTax = Cart.items.reduce((acc, item) => {
      const price = item.menuItemId?.price || 0;
      return acc + (item.quantity || 0) * price;
    }, 0);

    const taxAmount = totalAmountBeforeTax * taxRate;
    const totalAmount =
      Math.round((totalAmountBeforeTax + taxAmount) * 100) / 100;

    res.status(200).json({
      message: "Cart fetched successfully",
      data: {
        ...Cart.toObject(),
        totalAmount,
        totalAmountBeforeTax,
        taxAmount,
      },
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
  const { quantity, addOns = [] } = req.body;

  try {
    const cart = await CartSche.findOne({ userId }).populate({
      path: "items.menuItemId",
      select: "name description imageUrl price variants",
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the index of the item in the cart
    const itemIndex = cart.items.findIndex(
      (i) => i._id.toString() === cartItemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Menu item not found in cart" });
    }

    // If quantity <= 0 → remove the item
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity and addOns
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].addOns = addOns;
    }

    // Recalculate totalAmount from scratch (subtotal)
    const totalAmount = cart.items.reduce((sum, item) => {
      let price = Number(item.menuItemId?.price) || 0;

      if (item.variant && Array.isArray(item.menuItemId?.variants)) {
        const variant = item.menuItemId.variants.find(
          (v) => v._id.toString() === item.variant.toString()
        );
        if (variant) {
          price = Number(variant.price) || 0;
        }
      }

      const addOnPrice = Array.isArray(item.addOns)
        ? item.addOns.reduce(
            (aSum, addOn) => aSum + (Number(addOn?.price) || 0),
            0
          )
        : 0;

      const qty = Number(item.quantity) || 0;

      return sum + (price + addOnPrice) * qty;
    }, 0);

    // Calculate tax
    const taxRate = 0.05;
    const taxAmount = Math.round(totalAmount * taxRate * 100) / 100;

    // Total with tax
    const totalWithTax = Math.round((totalAmount + taxAmount) * 100) / 100;

    // Save to cart
    cart.taxAmount = taxAmount;
    cart.totalAmount = totalWithTax;

    await cart.save();

    res.status(200).json({
      message: "Cart updated successfully",
      data: cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update cart",
      error: error.message,
    });
  }
};

// Delete Cart
export const deleteCartItem = async (req, res) => {
  const { cartId, menuItemId } = req.params;

  try {
    const cart = await CartSche.findById(cartId).populate("items.menuItemId");
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Remove the item from cart.items
    const filteredItems = cart.items.filter(
      (item) => item.menuItemId._id.toString() !== menuItemId
    );

    if (filteredItems.length === cart.items.length) {
      return res.status(404).json({ message: "Menu item not found in cart" });
    }

    cart.items = filteredItems;

    // Calculate subtotal (sum of item price * quantity + addOns)
    const subTotal = cart.items.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      const addOnsTotal = item.addOns
        ? item.addOns.reduce(
            (acc, addOn) => acc + (Number(addOn.price) || 0),
            0
          )
        : 0;

      return sum + (price + addOnsTotal) * quantity;
    }, 0);

    // Calculate tax (5% of subtotal)
    const taxRate = 0.05;
    const taxAmount = Math.round(subTotal * taxRate * 100) / 100;

    // Calculate total including tax
    const totalAmount = Math.round((subTotal + taxAmount) * 100) / 100;

    // Update cart fields
    cart.subTotal = subTotal;
    cart.taxAmount = taxAmount;
    cart.totalAmount = totalAmount;

    await cart.save();

    return res.status(200).json({
      message: "Item removed and totals updated",
      cart,
      subTotal,
      taxAmount,
      totalAmount,
    });
  } catch (error) {
    console.error("Delete cart item error:", error);
    return res.status(500).json({
      message: "Failed to delete cart item",
      error: error.message,
    });
  }
};
