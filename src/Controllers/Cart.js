import CartSche from "../Models/Cart.js";
import FoodItems from "../Models/FoodItems.js";

// Coupon validation function
const validateCoupon = (couponCode) => {
  const coupons = {
    SAVE10: { type: "percentage", value: 10 },
    FREEDelivery: { type: "fixed", value: 30 },
  };
  return coupons[couponCode] || null;
};

// Create Cart
export const addToCart = async (req, res) => {
  const { userId, menuItemId } = req.params;
  const { variantId, quantity, addOns } = req.body;

  try {
    const menuItem = await FoodItems.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    let selectedVariant = null;
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
      selectedVariant = {
        size: variant.size,
        price: variant.price,
        _id: variant._id,
      };
    } else {
      selectedVariant = { size: null, price: menuItem.price, _id: null };
    }

    let basePrice = selectedVariant.price;
    if (addOns && addOns.length > 0) {
      const validAddOns = menuItem.addOns.filter((a) =>
        addOns.includes(a._id.toString())
      );
      basePrice += validAddOns.reduce((sum, a) => sum + a.price, 0);
    }

    const itemPriceBeforeTax = basePrice * quantity;
    const taxRate = 0.05;
    const taxAmount = Math.round(itemPriceBeforeTax * taxRate * 100) / 100;

    let cart = await CartSche.findOne({ userId });

    if (!cart) {
      // Create new cart if it doesn't exist
      cart = await CartSche.create({ userId, items: [] });
    }

    // Check for existing item with the same menuItemId, variantId, and addOns
    const existingItemIndex = cart.items.findIndex((item) => {
      const sameMenuItem = item.menuItemId.toString() === menuItemId;
      const sameVariant = !variantId
        ? !item.variant || !item.variant._id
        : item.variant &&
          item.variant._id &&
          item.variant._id.toString() === variantId;
      const sameAddOns =
        JSON.stringify(item.addOns.map((a) => a._id)) ===
        JSON.stringify(addOns || []);
      return sameMenuItem && sameVariant && sameAddOns;
    });

    if (existingItemIndex !== -1) {
      // Update existing item quantity and recalculate
      const existingItem = cart.items[existingItemIndex];
      const newQuantity = existingItem.quantity + quantity;
      const newItemPriceBeforeTax = basePrice * newQuantity;
      const newTaxAmount =
        Math.round(newItemPriceBeforeTax * taxRate * 100) / 100;

      cart.items[existingItemIndex] = {
        ...existingItem,
        quantity: newQuantity,
        price: newItemPriceBeforeTax,
        tax: newTaxAmount,
      };
    } else {
      // Add new item if it doesn't exist
      cart.items.push({
        menuItemId,
        variant: selectedVariant,
        quantity,
        addOns: addOns
          ? addOns.map((id) => ({ _id: id, name: "", price: 0 }))
          : [],
        price: itemPriceBeforeTax,
        tax: taxAmount,
      });
    }

    // Recalculate cart totals
    const totalAmountBeforeTax = cart.items.reduce(
      (sum, item) => sum + (Number(item.price) || 0),
      0
    );
    const taxAmountTotal =
      Math.round(totalAmountBeforeTax * taxRate * 100) / 100;
    const deliveryCharge = totalAmountBeforeTax >= 300 ? 0 : 30;

    let discount = 0;
    if (cart.couponCode) {
      const coupon = validateCoupon(cart.couponCode);
      if (coupon) {
        if (coupon.type === "percentage") {
          discount =
            Math.round(((totalAmountBeforeTax * coupon.value) / 100) * 100) /
            100;
        } else if (coupon.type === "fixed") {
          discount = coupon.value;
        }
        discount = Math.min(
          discount,
          totalAmountBeforeTax + taxAmountTotal + deliveryCharge
        );
      } else {
        cart.couponCode = null; // Invalidate invalid coupon
      }
    }

    const totalAmount =
      Math.round(
        (totalAmountBeforeTax + taxAmountTotal + deliveryCharge - discount) *
          100
      ) / 100;

    cart.subTotal = totalAmountBeforeTax;
    cart.taxAmount = taxAmountTotal;
    cart.deliveryCharge = deliveryCharge;
    cart.discount = discount;
    cart.totalAmount = totalAmount;

    await cart.save({ validateModifiedOnly: true });

    res.status(200).json({ message: "Item added to cart successfully", cart });
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

    const cart = await CartSche.findOne({ userId })
      .populate({
        path: "items.menuItemId",
        select: "name description imageUrl price variants addOns",
      })
      .populate("items.addOns");

    if (!cart || !cart.items || cart.items.length === 0) {
      return res
        .status(404)
        .json({ message: "No cart items found for the user" });
    }

    const totalAmountBeforeTax = cart.items.reduce((acc, item) => {
      return acc + (Number(item.price) || 0);
    }, 0);

    const taxRate = 0.05;
    const taxAmount = Math.round(totalAmountBeforeTax * taxRate * 100) / 100;
    const deliveryCharge = totalAmountBeforeTax >= 300 ? 0 : 30;

    let discount = 0;
    if (cart.couponCode) {
      const coupon = validateCoupon(cart.couponCode);
      if (coupon) {
        if (coupon.type === "percentage") {
          discount =
            Math.round(((totalAmountBeforeTax * coupon.value) / 100) * 100) /
            100;
        } else if (coupon.type === "fixed") {
          discount = coupon.value;
        }
        discount = Math.min(
          discount,
          totalAmountBeforeTax + taxAmount + deliveryCharge
        );
      } else {
        cart.couponCode = null;
        await cart.save({ validateModifiedOnly: true });
      }
    }

    const totalAmount =
      Math.round(
        (totalAmountBeforeTax + taxAmount + deliveryCharge - discount) * 100
      ) / 100;

    cart.subTotal = totalAmountBeforeTax;
    cart.taxAmount = taxAmount;
    cart.deliveryCharge = deliveryCharge;
    cart.discount = discount;
    cart.totalAmount = totalAmount;
    await cart.save({ validateModifiedOnly: true });

    res.status(200).json({
      message: "Cart fetched successfully",
      data: {
        ...cart.toObject(),
        totalAmount,
        totalAmountBeforeTax,
        taxAmount,
        deliveryCharge,
        discount,
      },
    });
  } catch (error) {
    console.error("Fetch cart error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch cart", error: error.message });
  }
};

// Edit Cart
export const updateCartItem = async (req, res) => {
  const { userId, cartItemId } = req.params;
  const { quantity, addOns = [] } = req.body;

  try {
    const cart = await CartSche.findOne({ userId })
      .populate({
        path: "items.menuItemId",
        select: "name description imageUrl price variants addOns",
      })
      .populate("items.addOns");

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (i) => i._id.toString() === cartItemId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Menu item not found in cart" });
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      const item = cart.items[itemIndex];
      const menuItem = item.menuItemId;
      let itemPrice = menuItem.price;

      if (item.variant && item.variant.size && menuItem.variants) {
        const variant = menuItem.variants.find(
          (v) => v._id.toString() === item.variant._id?.toString()
        );
        if (variant) itemPrice = variant.price;
      }

      let addOnPrice = 0;
      if (addOns.length > 0 && menuItem.addOns) {
        addOnPrice = menuItem.addOns
          .filter((a) => addOns.includes(a._id.toString()))
          .reduce((sum, a) => sum + a.price, 0);
      }

      const itemPriceBeforeTax = (itemPrice + addOnPrice) * quantity;
      const taxAmount = Math.round(itemPriceBeforeTax * 0.05 * 100) / 100;

      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].addOns = addOns.map((id) => ({
        _id: id,
        name: "",
        price: 0,
      }));
      cart.items[itemIndex].price = itemPriceBeforeTax;
      cart.items[itemIndex].tax = taxAmount;
    }

    const totalAmountBeforeTax = cart.items.reduce(
      (sum, item) => sum + (Number(item.price) || 0),
      0
    );
    const taxAmount = Math.round(totalAmountBeforeTax * 0.05 * 100) / 100;
    const deliveryCharge = totalAmountBeforeTax >= 300 ? 0 : 30;

    let discount = 0;
    if (cart.couponCode) {
      const coupon = validateCoupon(cart.couponCode);
      if (coupon) {
        if (coupon.type === "percentage") {
          discount =
            Math.round(((totalAmountBeforeTax * coupon.value) / 100) * 100) /
            100;
        } else if (coupon.type === "fixed") {
          discount = coupon.value;
        }
        discount = Math.min(
          discount,
          totalAmountBeforeTax + taxAmount + deliveryCharge
        );
      } else {
        cart.couponCode = null;
      }
    }

    const totalAmount =
      Math.round(
        (totalAmountBeforeTax + taxAmount + deliveryCharge - discount) * 100
      ) / 100;

    cart.subTotal = totalAmountBeforeTax;
    cart.taxAmount = taxAmount;
    cart.deliveryCharge = deliveryCharge;
    cart.discount = discount;
    cart.totalAmount = totalAmount;
    await cart.save({ validateModifiedOnly: true });

    res.status(200).json({ message: "Cart updated successfully", data: cart });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to update cart", error: error.message });
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

    const originalLength = cart.items.length;
    const updatedItems = cart.items.filter(
      (item) => item.menuItemId._id.toString() !== menuItemId
    );

    if (updatedItems.length === originalLength) {
      return res.status(404).json({ message: "Menu item not found in cart" });
    }

    await CartSche.updateOne(
      { _id: cartId },
      { $set: { items: updatedItems } }
    );

    const updatedCart = await CartSche.findById(cartId).populate(
      "items.menuItemId"
    );
    const totalAmountBeforeTax = updatedCart.items.reduce((sum, item) => {
      return sum + (Number(item.price) || 0);
    }, 0);

    const taxRate = 0.05;
    const taxAmount = Math.round(totalAmountBeforeTax * taxRate * 100) / 100;
    const deliveryCharge = totalAmountBeforeTax >= 300 ? 0 : 30;

    let discount = 0;
    if (updatedCart.couponCode) {
      const coupon = validateCoupon(updatedCart.couponCode);
      if (coupon) {
        if (coupon.type === "percentage") {
          discount =
            Math.round(((totalAmountBeforeTax * coupon.value) / 100) * 100) /
            100;
        } else if (coupon.type === "fixed") {
          discount = coupon.value;
        }
        discount = Math.min(
          discount,
          totalAmountBeforeTax + taxAmount + deliveryCharge
        );
      } else {
        updatedCart.couponCode = null;
        await updatedCart.save({ validateModifiedOnly: true });
      }
    }

    const totalAmount =
      Math.round(
        (totalAmountBeforeTax + taxAmount + deliveryCharge - discount) * 100
      ) / 100;

    await CartSche.updateOne(
      { _id: cartId },
      {
        $set: {
          subTotal: totalAmountBeforeTax,
          taxAmount: taxAmount,
          deliveryCharge: deliveryCharge,
          discount: discount,
          totalAmount: totalAmount,
        },
      }
    );

    res.status(200).json({
      message: "Item removed and totals updated",
      cart: updatedCart,
      subTotal: totalAmountBeforeTax,
      taxAmount,
      deliveryCharge,
      discount,
      totalAmount,
    });
  } catch (error) {
    console.error("Delete cart item error:", error);
    res.status(500).json({
      message: "Failed to delete cart item",
      error: error.message,
    });
  }
};

// apply coupon
export const applyCoupon = async (req, res) => {
  const { userId } = req.params;
  const { couponCode } = req.body;

  try {
    const cart = await CartSche.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const coupon = validateCoupon(couponCode);
    if (!coupon) {
      return res.status(400).json({ message: "Invalid coupon code" });
    }

    cart.couponCode = couponCode;
    await cart.save({ validateModifiedOnly: true });

    const totalAmountBeforeTax = cart.items.reduce(
      (sum, item) => sum + (Number(item.price) || 0),
      0
    );
    const taxRate = 0.05;
    const taxAmount = Math.round(totalAmountBeforeTax * taxRate * 100) / 100;
    const deliveryCharge = totalAmountBeforeTax >= 300 ? 0 : 30;
    let discount = 0;
    if (coupon.type === "percentage") {
      discount =
        Math.round(((totalAmountBeforeTax * coupon.value) / 100) * 100) / 100;
    } else if (coupon.type === "fixed") {
      discount = coupon.value;
    }
    discount = Math.min(
      discount,
      totalAmountBeforeTax + taxAmount + deliveryCharge
    );

    const totalAmount =
      Math.round(
        (totalAmountBeforeTax + taxAmount + deliveryCharge - discount) * 100
      ) / 100;

    cart.discount = discount;
    cart.totalAmount = totalAmount;
    await cart.save({ validateModifiedOnly: true });

    res.status(200).json({
      message: "Coupon applied successfully",
      data: {
        ...cart.toObject(),
        totalAmount,
        totalAmountBeforeTax,
        taxAmount,
        deliveryCharge,
        discount,
      },
    });
  } catch (error) {
    console.error("Apply coupon error:", error);
    res
      .status(500)
      .json({ message: "Failed to apply coupon", error: error.message });
  }
};
