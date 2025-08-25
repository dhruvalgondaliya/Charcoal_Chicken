import OrderSche from "../Models/OrderSch.js";
import CartSche from "../Models/Cart.js";
import mongoose from "mongoose";
import sendMail from "../services/mailService.js";
import User from "../Models/User.js";
import { formatCurrency } from "../Utiles/Currency.js";

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

    // Assuming all items in the cart
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

  try {
    const orders = await OrderSche.find({ userId })
      .populate("items.menuItemId", "name description price")
      .populate("restaurantId", "name address")
      .populate("userId", "userName email phone")
      .sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No Orders Found for this User" });
    }

    const formattedOrders = orders.map((order) => {
      // Subtotal calculation (variant price > menuItem price)
      const subtotal =
        order.items?.reduce((sum, i) => {
          const price = i.variant?.price || i.menuItemId?.price || 0;
          return sum + price * (i.quantity || 0);
        }, 0) || 0;

      // Example tax: 5%
      const taxRate = 0.05;
      const taxAmount = subtotal * taxRate;

      const totalAmount = subtotal + taxAmount;

      // If order delivered → show only receipt
      if (order.orderStatus === "delivered") {
        return {
          _id: order._id,
          createdAt: order.createdAt,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
          restaurant: order.restaurantId,
          user: order.userId,
          items: order.items,
          paymentType: order.paymentMethod,
          subtotal,
          taxAmount,
          totalAmount,
          receipt: {
            orderId: order._id,
            restaurantName: order.restaurantId?.name,
            address: order.restaurantId?.address,
            user: order.userId,
            user: order.userName,
            items: order.items.map((i) => ({
              name: i.menuItemId?.name,
              description: i.menuItemId?.description,
              variant: i.variant || null,
              price: i.variant?.price || i.menuItemId?.price,
              quantity: i.quantity,
              total:
                (i.quantity || 0) *
                (i.variant?.price || i.menuItemId?.price || 0),
            })),
            subtotal,
            taxAmount,
            totalAmount,
            paymentStatus: order.paymentStatus === "paid" ? "Paid" : "Pending",
          },
        };
      }

      // If not delivered → return normal order
      return {
        ...order._doc,
        createdAt: order.createdAt,
        subtotal,
        taxAmount,
        totalAmount,
        user: order.userId,
      };
    });

    res.status(200).json({
      message: "Fetched user orders successfully!",
      data: formattedOrders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch user orders",
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

    // Search
    if (typeof search === "string" && search.trim() !== "") {
      const orConditions = [
        { "deliveryAddress.FullName": { $regex: search, $options: "i" } },
        { "deliveryAddress.PhoneNumber": { $regex: search, $options: "i" } },
        { "deliveryAddress.City": { $regex: search, $options: "i" } },
        { paymentStatus: { $regex: search, $options: "i" } },
        { orderStatus: { $regex: search, $options: "i" } },
        { paymentMethod: { $regex: search, $options: "i" } },
      ];

      // If search looks like ObjectId
      if (mongoose.Types.ObjectId.isValid(search)) {
        orConditions.push({ _id: mongoose.Types.ObjectId(search) });
      }

      // If search is a valid date string (like "2025-08-20")
      if (!isNaN(Date.parse(search))) {
        const date = new Date(search);
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);

        orConditions.push({ createdAt: { $gte: date, $lt: nextDay } });
      }

      query.$or = orConditions;
    }

    if (orderStatus) query.orderStatus = orderStatus;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    // 📅 Date filter
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

    // ✅ Build a new array with totalAmount
    const updatedOrders = orders.map((order) => {
      const subtotal =
        order.items?.reduce((sum, i) => {
          const price = i.variant?.price || i.menuItemId?.price || 0;
          return sum + price * (i.quantity || 0);
        }, 0) || 0;

      // Example tax: 5%
      const taxRate = 0.05;
      const taxAmount = subtotal * taxRate;
      const totalAmount = subtotal + taxAmount;

      return {
        ...order._doc,
        cartId: {
          ...order.cartId?._doc,
          subtotal,
          taxAmount,
          totalAmount,
        },
      };
    });

    const total = await OrderSche.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: {
        orders: updatedOrders, // Renamed to be more descriptive
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// update pyment status
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
    ).populate("items.menuItemId", "name price"); // Populate menuItem data

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Send email only when order status is "delivered"
    if (orderStatus === "delivered") {
      // Fetch customer email or Name
      let customerEmail = updatedOrder.deliveryAddress?.Email;
      let customerName = updatedOrder.deliveryAddress?.FullName;

      // If email is not in deliveryAddress, fetch from User model
      if (!customerEmail && updatedOrder.userId) {
        const user = await User.findById(updatedOrder.userId);
        customerEmail = user?.Email;
        customerName = user?.name || customerName;
      }

      if (!customerEmail) {
        console.warn("No customer email found for order:", orderId);
      } else {
        try {
          // Generate simple text email with proper error handling
          const textEmail = generateSimpleOrderReceipt(
            updatedOrder,
            customerName
          );

          // Send simple text email (no HTML)
          await sendMail(
            customerEmail,
            `Order Receipt - Order #${
              updatedOrder.orderNumber || updatedOrder._id
            }`,
            textEmail 
          );
        } catch (emailError) {
          console.error(
            "Failed to send order receipt email:",
            emailError.message
          );
        }
      }
    }

    res.status(200).json({
      message: "Order and payment status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Failed to update order:", error.message);
    res.status(500).json({
      message: "Failed to update statuses",
      error: error.message,
    });
  }
};

// Fixed email generation function with proper error handling
const generateSimpleOrderReceipt = (order, customerName) => {
  try {
    const {
      orderNumber,
      items,
      totalAmount,
      deliveryAddress,
      orderStatus,
      paymentStatus,
      createdAt,
    } = order;

    // Safely calculate total amount if not provided
    const calculatedTotal = totalAmount || calculateOrderTotal(items);

    // Format items for text email
    const itemsText = items
      .map((item) => {
        const itemName =
          item.FullName ||
          (item.menuItemId && item.menuItemId.name) ||
          "Unknown Item";
        const itemPrice = item.price || 0;
        const itemQuantity = item.quantity || 1;
        const itemTotal = itemPrice * itemQuantity;

        return `${itemName} x ${itemQuantity} = $${itemTotal.toFixed(2)}`;
      })
      .join("\n");

    return `
      Order Receipt

      Dear ${customerName || deliveryAddress?.FullName || "Customer"},

      Thank you for your order! Below are the details of your order:

      Order Details:
      Order Number: ${orderNumber || order._id || "N/A"}
      Order Date: ${
        createdAt ? new Date(createdAt).toLocaleDateString() : "N/A"
      }
      Order Status: ${orderStatus || "N/A"}
      Payment Status: ${paymentStatus || "N/A"}

      Items:
      ${itemsText || "No items found"}

      Total Amount: ${formatCurrency(calculatedTotal || 0)}

        Delivery Address:
        ${deliveryAddress?.FullName || "N/A"}
        ${deliveryAddress?.PhoneNumber || "N/A"}
        ${deliveryAddress?.Address || "N/A"}
        ${deliveryAddress?.City || "N/A"} ${deliveryAddress?.ZIPCode || "N/A"}

      Thank you for choosing us!
      Best regards,
      Your Restaurant Team
          `;
  } catch (error) {
    console.error("Error generating email receipt:", error);
    // Fallback simple message if generation fails
    return `
    Order Receipt

    Dear Customer,

    Thank you for your order! Your order #${order._id} has been delivered.

    Please contact us if you need more details about your order.

    Best regards,
    Your Restaurant Team
        `;
  }
};

// Helper function to calculate order total if not provided
const calculateOrderTotal = (items) => {
  try {
    return items.reduce((total, item) => {
      const itemPrice = item.price || 0;
      const itemQuantity = item.quantity || 1;
      return total + itemPrice * itemQuantity;
    }, 0);
  } catch (error) {
    console.error("Error calculating order total:", error);
    return 0;
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
export const cancelUserOrder = async (req, res) => {
  const { userId, OrderId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(OrderId)) {
      return res.status(400).json({ message: "Invalid Order ID" });
    }

    // Instead of deleting → update status to "Cancelled"
    const cancelledOrder = await OrderSche.findOneAndUpdate(
      { _id: OrderId, userId },
      { $set: { orderStatus: "cancelled", cancelledAt: new Date() } },
      { new: true }
    );

    if (!cancelledOrder) {
      return res.status(404).json({
        message: "Order not found or doesn't belong to this user",
      });
    }

    res.status(200).json({
      message: "Order cancelled successfully",
      data: cancelledOrder,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to cancel user order",
      error: error.message,
    });
  }
};
