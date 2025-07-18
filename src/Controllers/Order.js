import OrderSche from "../Models/OrderSchema .js";
import mongoose from "mongoose";

// Create Order
export const OrderCreate = async (req, res) => {
  const { userId } = req.params;
  const { restaurantId, items, deliveryAddress } = req.body;

  try {
    // Calculate totalAmount
    let totalAmount = 0;

    items.map((item) => {
      let itemTotal = item.price * item.quantity;

      if (item.addOn && Array.isArray(item.addOn)) {
        item.addOn.map((addon) => {
          itemTotal += addon.price || 0;
        });
      }
      totalAmount += itemTotal;
    });

    const orderData = {
      userId,
      restaurantId,
      deliveryAddress,
      items,
      totalAmount,
    };

    const order = await OrderSche.create(orderData);

    res.status(201).json({
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to place order",
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

// update status in oreder or Payment
export const updateOrderAndPaymentStatus = async (req, res) => {
  const { orderId } = req.params;
  const { orderStatus, paymentStatus } = req.body;

  const validOrderStatuses = [
    "pending",
    "confirmed",
    "preparing",
    "on the way",
    "delivered",
    "cancelled",
  ];

  const validPaymentStatuses = ["pending", "paid"];

  if (orderStatus && !validOrderStatuses.includes(orderStatus)) {
    return res.status(400).json({ message: "Invalid order status" });
  }

  if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
    return res.status(400).json({ message: "Invalid payment status" });
  }

  try {
    const updateFields = {};

    if (orderStatus) updateFields.orderStatus = orderStatus;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;

    const updatedOrder = await OrderSche.findByIdAndUpdate(
      orderId,
      updateFields,
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order and payment status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update statuses",
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
