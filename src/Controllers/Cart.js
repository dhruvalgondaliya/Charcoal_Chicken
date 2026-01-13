import mongoose from "mongoose";
import CartSche from "../Models/Cart.js";
import couponSch from "../Models/CouponCode.js";
import FoodItems from "../Models/FoodItems.js";

// ADD To Cart
export const addToCart = async (req, res) => {
  const { userId, menuItemId } = req.params;
  const { variantId, quantity = 1, addOns = [] } = req.body;

  try {
    // Login validation
    if (!userId || userId === "null") {
      return res.status(401).json({
        message: "Please login first to add items to your cart",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user" });
    }

    //Find menu item
    const menuItem = await FoodItems.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // Resolve variant
    let selectedVariant = {
      _id: null,
      size: null,
      price: menuItem.price,
    };

    if (menuItem.variants?.length) {
      if (!variantId) {
        return res
          .status(400)
          .json({ message: "Variant is required for this item" });
      }

      const variant = menuItem.variants.find(
        (v) => v._id.toString() === variantId
      );

      if (!variant) {
        return res.status(400).json({ message: "Variant not found" });
      }

      selectedVariant = {
        _id: variant._id,
        size: variant.size,
        price: variant.price,
      };
    }

    // Resolve add-ons
    const validAddOns =
      menuItem.addOns?.filter((a) => addOns.includes(a._id.toString())) || [];

    const addOnTotal = validAddOns.reduce((s, a) => s + a.price, 0);

    // Price calculation
    const unitPrice = selectedVariant.price + addOnTotal;
    const itemPriceBeforeTax = unitPrice * quantity;

    const TAX_RATE = 0.05;
    const taxAmount = +(itemPriceBeforeTax * TAX_RATE).toFixed(2);

    // Find or create cart
    let cart = await CartSche.findOne({ userId });

    if (!cart) {
      cart = new CartSche({
        userId,
        restaurantId: menuItem.restaurantId,
        items: [],
      });
    }

    //Reset cart if restaurant changed
    if (
      cart.restaurantId &&
      cart.restaurantId.toString() !== menuItem.restaurantId.toString()
    ) {
      cart.items = [];
      cart.restaurantId = menuItem.restaurantId;
      cart.code = null;
      cart.subTotal = 0;
      cart.taxAmount = 0;
      cart.deliveryCharge = 0;
      cart.discount = 0;
      cart.totalAmount = 0;
    }

    // 7. Check for existing item
    const isSameItem = (item) => {
      if (item.menuItemId.toString() !== menuItemId) return false;

      const oldVar = item.variant?._id?.toString() || null;
      const newVar = selectedVariant._id?.toString() || null;
      if (oldVar !== newVar) return false;

      const oldAddOns = item.addOns.map((a) => a._id.toString()).sort();
      const newAddOns = validAddOns.map((a) => a._id.toString()).sort();

      return JSON.stringify(oldAddOns) === JSON.stringify(newAddOns);
    };

    const existingIndex = cart.items.findIndex(isSameItem);

    if (existingIndex !== -1) {
      const item = cart.items[existingIndex];
      item.quantity += quantity;
      item.price += itemPriceBeforeTax;
      item.tax += taxAmount;
    } else {
      cart.items.push({
        menuItemId,
        restaurantId: menuItem.restaurantId,
        variant: selectedVariant,
        quantity,
        addOns: validAddOns.map((a) => ({
          _id: a._id,
          name: a.name,
          price: a.price,
        })),
        price: itemPriceBeforeTax,
        tax: taxAmount,
      });
    }

    // Recalculate totals
    const subTotal = cart.items.reduce((s, i) => s + Number(i.price || 0), 0);

    const taxAmountTotal = +(subTotal * TAX_RATE).toFixed(2);
    const deliveryCharge = subTotal >= 300 ? 0 : 30;

    // Coupon
    let discount = 0;
    if (cart.code) {
      const coupon = await couponSch.findOne({ code: cart.code });
      if (coupon) {
        discount =
          coupon.type === "percentage"
            ? +(subTotal * (coupon.value / 100)).toFixed(2)
            : coupon.value;

        discount = Math.min(
          discount,
          subTotal + taxAmountTotal + deliveryCharge
        );
      } else {
        cart.code = null;
      }
    }

    const totalAmount = +(
      subTotal +
      taxAmountTotal +
      deliveryCharge -
      discount
    ).toFixed(2);

    cart.subTotal = subTotal;
    cart.taxAmount = taxAmountTotal;
    cart.deliveryCharge = deliveryCharge;
    cart.discount = discount;
    cart.totalAmount = totalAmount;

    await cart.save({ validateModifiedOnly: true });

    res.status(200).json({
      message:
        existingIndex !== -1
          ? "Item quantity updated in cart"
          : "Item added to cart successfully",
      cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      message: "Failed to add to cart",
      error: error.message,
    });
  }
};

// Fetch Cart By UserId
export const fetchCartByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const cart = await CartSche.findOne({ userId })
      .populate({
        path: "items.restaurantId",
        select: "name",
      })
      .populate({
        path: "items.menuItemId",
        select: "name description imageUrl price variants addOns",
      });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res
        .status(404)
        .json({ message: "No cart items found for the user" });
    }

    // Always recalc values from cart items
    const cartLength = cart.items.length;
    const totalQuantity = cart.items.reduce(
      (acc, item) => acc + (item.quantity || 1),
      0
    );

    const totalAmountBeforeTax = cart.items.reduce((acc, item) => {
      return acc + (Number(item.price) || 0) * (item.quantity || 1);
    }, 0);

    const taxRate = 0.05;
    const taxAmount = Math.round(totalAmountBeforeTax * taxRate * 100) / 100;
    const deliveryCharge = totalAmountBeforeTax >= 300 ? 0 : 30;

    let discount = 0;
    if (cart.code) {
      const coupon = await cart.code;
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
        cart.code = null;
        await cart.save({ validateModifiedOnly: true });
      }
    }

    const totalAmount =
      Math.round(
        (totalAmountBeforeTax + taxAmount + deliveryCharge - discount) * 100
      ) / 100;

    res.status(200).json({
      message: "Cart fetched successfully",
      data: {
        ...cart.toObject(),
        cartLength,
        totalQuantity,
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
    if (cart.code) {
      const coupon = await couponSch.findOne(cart.code);
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
        cart.code = null;
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
    if (updatedCart.code) {
      const coupon = await couponSch.findOne(updatedCart.code);
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
        updatedCart.code = null;
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
  const { code } = req.body;

  try {
    const cart = await CartSche.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Check if user already used a coupon for this cart/order
    if (cart.code) {
      return res
        .status(400)
        .json({ message: "Coupon already apply for this order" });
    }

    const couponCode = code.trim().toUpperCase();
    const coupon = await couponSch.findOne({ code: couponCode });
    if (!coupon) {
      return res.status(400).json({ message: "Invalid coupon code" });
    }

    const totalAmountBeforeTax = cart.items.reduce(
      (sum, item) => sum + (Number(item.price) || 0),
      0
    );

    // Apply only if total >= 500
    if (totalAmountBeforeTax < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Coupon valid only for orders above ₹${coupon.minOrderAmount}`,
      });
    }

    const taxRate = 0.05;
    const taxAmount = Math.round(totalAmountBeforeTax * taxRate * 100) / 100;
    const deliveryCharge = totalAmountBeforeTax >= 300 ? 0 : 30;

    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount =
        Math.round(totalAmountBeforeTax * coupon.discountValue * 100) /
        100 /
        100;
    } else if (coupon.discountType === "flat") {
      discount = coupon.discountValue;
    }

    // Ensure discount doesn’t exceed payable
    discount = Math.min(
      discount,
      totalAmountBeforeTax + taxAmount + deliveryCharge
    );

    const totalAmount =
      Math.round(
        (totalAmountBeforeTax + taxAmount + deliveryCharge - discount) * 100
      ) / 100;

    // Save coupon info in backend (once per order)
    cart.code = coupon.code;
    cart.discount = discount;
    cart.totalAmount = totalAmount;
    cart.couponId = coupon._id;

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
