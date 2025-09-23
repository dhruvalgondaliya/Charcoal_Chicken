import mongoose from "mongoose";
import couponSch from "../Models/CouponCode.js";

// Get all coupons with pagination + search
export const getCoupons = async (req, res) => {
  const { restaurantId } = req.params;
  const { page = 1, limit = 10, search = "" } = req.query;

  try {
    if (!restaurantId) {
      return res
        .status(400)
        .json({ success: false, message: "Restaurant Not Found" });
    }

    const query = {
      restaurantId,
      ...(search ? { code: { $regex: search, $options: "i" } } : {}),
    };

    const total = await couponSch.countDocuments(query);
    const coupons = await couponSch
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: coupons,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create coupon
export const createCoupon = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { code, discountType, discountValue, minOrderAmount, expiryDate } =
      req.body;

    if (!restaurantId || !mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid restaurantId" });
    }

    if (!code) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon code required" });
    }

    const existing = await couponSch.findOne({
      code: code.toUpperCase(),
      restaurantId,
    });

    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon code already exists" });
    }

    const coupon = new couponSch({
      restaurantId,
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minOrderAmount,
      expiryDate,
    });

    await coupon.save();
    return res.status(201).json({ success: true, data: coupon });
  } catch (err) {
    console.error("Error creating coupon:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update coupon
export const updateCoupon = async (req, res) => {
  const { restaurantId, couponId } = req.params;

  try {
    if (!restaurantId || !couponId) {
      return res.status(400).json({ success: false, message: "Invalid IDs" });
    }

    const coupon = await couponSch.findOneAndUpdate(
      { _id: couponId, restaurantId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }

    res.json({ success: true, data: coupon });
  } catch (err) {
    console.error("Error updating coupon", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete coupon
export const deleteCoupon = async (req, res) => {
  const { restaurantId, couponId } = req.params;

  try {
    if (!restaurantId || !couponId) {
      return res.status(400).json({ success: false, message: "Invalid IDs" });
    }

    const coupon = await couponSch.findOneAndDelete({
      _id: couponId,
      restaurantId,
    });

    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }

    res.json({ success: true, message: "Coupon deleted" });
  } catch (err) {
    console.error("Error deleting coupon", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
