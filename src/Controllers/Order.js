import OrderSche from "../Models/OrderSchema .js";
import CartSche from "../Models/Cart.js";
import mongoose from "mongoose";

// create Order Api
export const createOrder = async (req, res) => {
  const { userId, cartId } = req.params;
  const { deliveryAddress, paymentMethod } = req.body;

  try {
    const cart = await CartSche.findOne({ _id: cartId, userId }).populate(
      "items.menuItemId"
    );

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    if (!cart.items.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Assuming all items in the cart are from the same restaurant
    const restaurantId = cart.items[0]?.menuItemId?.restaurantId;
    if (!restaurantId) {
      return res
        .status(400)
        .json({ message: "Restaurant ID not found in cart items" });
    }

    const order = await OrderSche.create({
      userId,
      restaurantId,
      cartId,
      items: cart.items,
      deliveryAddress,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "paid",

      subTotal: cart.subTotal,
      taxAmount: cart.taxAmount,
      deliveryCharge: cart.deliveryCharge,
      totalAmount: cart.totalAmount,
    });

    // Clear cart after placing order
    cart.items = [];
    await cart.save();

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
      orderId: newOrder._id,
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
  const { userId } = req.params;
  console.log("testing userid Fetch:", userId);

  try {
    const orders = await OrderSche.find({ userId })
      .populate("items.menuItemId", "name description price")
      .populate("restaurantId", "name address")
      .populate("cartId", "");
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

// Get restoruntBy order
export const getRestaurantOrders = async (req, res) => {
  const { restaurantId } = req.params;
  const {
    page = 1,
    limit = 10,
    search = "",
    orderStatus,
    paymentStatus,
    startDate,
    endDate,
  } = req.query;

  try {
    const query = { restaurantId };

    // Search in customer name or order ID
    if (typeof search === "string" && search.trim() !== "") {
      query.$or = [
        { FullName: { $regex: search, $options: "i" } },
        mongoose.Types.ObjectId.isValid(search)
          ? { _id: mongoose.Types.ObjectId(search) }
          : {},
      ];
    }

    // Filter by order status
    if (orderStatus) {
      query.orderStatus = orderStatus;
    }

    // Filter by payment status
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    // Filter by date range
    if (startDate && !isNaN(Date.parse(startDate))) {
      query.createdAt = { ...query.createdAt, $gte: new Date(startDate) };
    }
    if (endDate && !isNaN(Date.parse(endDate))) {
      query.createdAt = { ...query.createdAt, $lte: new Date(endDate) };
    }

    const skip = (page - 1) * limit;

    const orders = await OrderSche.find(query)
      .populate("items.menuItemId", "name description price")
      .populate("restaurantId", "name address")
      .populate("cartId")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await OrderSche.countDocuments(query);

    res.status(200).json({
      message: "Orders fetched successfully",
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// update status in oreder or Payment
export const updateOrderAndPaymentStatus = async (req, res) => {
  const { orderId } = req.params;
  const { orderStatus, paymentStatus } = req.body;

  const validOrderStatuses = [
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
