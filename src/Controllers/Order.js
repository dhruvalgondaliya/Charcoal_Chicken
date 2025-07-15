import OrderSche from "../Models/OrderSchema .js";
import mongoose from "mongoose";

// Create Order
export const OrderCreate = async (req, res) => {
  const { userId, restaurantId } = req.params;

  try {
    const orderData = {
      userId,
      restaurantId,
      ...req.body,
    };

    const order = await OrderSche.create(orderData);

    res.status(201).json({
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to Order placed",
      error: error.message,
    });
  }
};

// Get All Order
export const getAllOrder = async (req, res) => {
  try {
    const orders = await OrderSche.find()
      .populate("userId", "userName Email")
      .populate("restaurantId", "name address")
      .populate("items.menuItemId", "name description price");

    res.status(200).json({
      messages: "All Order Fetch SuccessFully!",
      totalOrder: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      messages: "Failed To Fetch All Order",
      error: error.message,
    });
  }
};

// Get UserByIdOrder
export const getUserByIdOrder = async (req, res) => {
  try {
    const orders = await OrderSche.find({ userId: req.params.id })
      .populate("items.menuItemId", "name description price")
      .populate("restaurantId", "name address");

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ messages: "No Orders Found for this User" });
    }

    res.status(200).json({
      messages: " fetched for userOrder successfully!",
      totalOrder: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      messages: "Failed to fetch user orders",
      error: error.message,
    });
  }
};

// Update User Order
export const updateUserOrder = async (req, res) => {
  const { userId, OrderId } = req.params;
  const update = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(OrderId)) {
      return res.status(400).json({ message: "Invalid Order ID" });
    }

    const order = await OrderSche.findOneAndUpdate(
      { userId: userId, _id: OrderId },
      update,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Order updated successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update the order",
      error: error.message,
    });
  }
};

// Delete User Order
export const deleteUserOrder = async (req, res) => {
  const { userId, OrderId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(OrderId)) {
      return res.status(400).json({ message: "Invalid Order ID" });
    }

    const deletedOrder = await OrderSche.findOneAndDelete({
      _id: OrderId,
      userId: userId,
    });

    if (!deletedOrder) {
      return res.status(404).json({
        message: "Order not found or doesn't belong to this user",
      });
    }

    res.status(200).json({
      message: "Order deleted successfully",
      data: deletedOrder,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete user order",
      error: error.message,
    });
  }
};

