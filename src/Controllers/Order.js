import OrderSche from "../Models/OrderSch.js";
import CartSche from "../Models/Cart.js";
import mongoose from "mongoose";
import User from "../Models/User.js";
import { sendOrderReceiptEmail } from "../services/emailService.js";

// create Order Api
export const createOrder = async (req, res) => {
  const { userId, cartId } = req.params;
  const { deliveryAddress, paymentMethod } = req.body;

  try {
    const cart = await CartSche.findOne({ _id: cartId, userId }).populate(
      "items.menuItemId"
    );

    if (!deliveryAddress) {
      return res.status(400).json({ message: "Delivery address is required" });
    }
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    if (!cart.items.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Assuming all items in the cart belong to the same restaurant
    const restaurantId = cart.items[0]?.menuItemId?.restaurantId;
    if (!restaurantId) {
      return res
        .status(400)
        .json({ message: "Restaurant ID not found in cart items" });
    }

    // Calculate subtotal
    const subTotal = cart.items.reduce((acc, item) => {
      const itemPrice = item.variant?.price || item.price || 0;
      const quantity = Number(item.quantity || 0);
      return acc + itemPrice * quantity;
    }, 0);

    const taxAmount = Number((subTotal * 0.05).toFixed(2));
    const deliveryCharge = subTotal >= 300 ? 0 : 30;

    // Use discount from cart (if any)
    const discount = cart.discount || 0;

    // Apply discount to total
    const totalAmount = Number(
      (subTotal + taxAmount + deliveryCharge - discount).toFixed(2)
    );

    const order = await OrderSche.create({
      userId,
      restaurantId,
      cartId,
      items: cart.items,
      deliveryAddress,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
      subTotal: subTotal,
      discount: discount,
      couponCode: cart.couponCode || null,
      taxAmount: taxAmount,
      deliveryCharge: deliveryCharge,
      totalAmount: totalAmount,
    });

    cart.items = [];
    cart.couponCode = null;
    cart.discount = 0;
    cart.totalAmount = 0;
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
  const { page = 1, limit = 10, search = "" } = req.query;

  try {
    // Pagination
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    // Search filter
    let searchFilter = {};
    if (search) {
      searchFilter = {
        $or: [
          { orderStatus: { $regex: search, $options: "i" } },
          { paymentStatus: { $regex: search, $options: "i" } },
        ],
      };
    }

    // Find matching orders
    const orders = await OrderSche.find({ userId, ...searchFilter })
      .populate("items.menuItemId", "name description price")
      .populate("restaurantId", "name address")
      .populate("userId", "userName email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    // Count total for pagination
    const totalOrders = await OrderSche.countDocuments({
      userId,
      ...searchFilter,
    });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No Orders Found for this User" });
    }

    // Format results
    const formattedOrders = orders.map((order) => {
      const subtotal =
        order.items?.reduce((sum, i) => {
          const price = i.variant?.price || i.menuItemId?.price || 0;
          return sum + price * (i.quantity || 0);
        }, 0) || 0;

      const taxRate = 0.05;
      const taxAmount = subtotal * taxRate;
      const deliveryCharge = subtotal >= 300 ? 0 : 30;
      const totalAmount = subtotal + taxAmount + deliveryCharge;

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
          deliveryCharge,
          totalAmount,
          receipt: {
            orderId: order._id,
            restaurantName: order.restaurantId?.name,
            address: order.restaurantId?.address,
            user: order.userId,
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
            deliveryCharge,
            totalAmount,
            paymentStatus: order.paymentStatus === "paid" ? "Paid" : "Pending",
          },
        };
      }

      return {
        ...order._doc,
        createdAt: order.createdAt,
        subtotal,
        taxAmount,
        deliveryCharge,
        totalAmount,
        user: order.userId,
      };
    });

    res.status(200).json({
      message: "Fetched user orders successfully!",
      data: formattedOrders,
      pagination: {
        totalOrders,
        totalPages: Math.ceil(totalOrders / limitNumber),
        currentPage: pageNumber,
        pageSize: limitNumber,
      },
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

    // 🔎 Search
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

    // 🛠 Filters
    if (orderStatus) query.orderStatus = orderStatus;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    // Date filter
    if (startDate && !isNaN(Date.parse(startDate))) {
      query.createdAt = { ...query.createdAt, $gte: new Date(startDate) };
    }
    if (endDate && !isNaN(Date.parse(endDate))) {
      query.createdAt = { ...query.createdAt, $lte: new Date(endDate) };
    }

    const skip = (page - 1) * limit;

    //  Paginated orders
    const orders = await OrderSche.find(query)
      .populate("items.menuItemId", "name description price")
      .populate("restaurantId", "name address")
      .populate("cartId")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Calculate amounts for each order
    const updatedOrders = orders.map((order) => {
      const subtotal =
        order.items?.reduce((sum, i) => {
          const price = i.variant?.price || i.menuItemId?.price || 0;
          return sum + price * (i.quantity || 0);
        }, 0) || 0;

      const taxRate = 0.05;
      const taxAmount = Number((subtotal * taxRate).toFixed(2));
      const deliveryCharge = subtotal >= 300 ? 0 : 30;
      const discount = order.discount || 0;
      const couponCode = order.couponCode || null;
      const totalAmount = Number(
        (subtotal + taxAmount + deliveryCharge - discount).toFixed(2)
      );

      return {
        ...order._doc,
        subtotal,
        taxAmount,
        deliveryCharge,
        discount,
        couponCode,
        totalAmount,
      };
    });

    const total = await OrderSche.countDocuments(query);

    // Grand total (only delivered orders, case-insensitive)
    const deliveredOrders = await OrderSche.find({
      ...query,
      orderStatus: { $regex: /^delivered$/i },
    });

    const grandTotal = deliveredOrders.reduce((sum, order) => {
      const subtotal =
        order.items?.reduce((s, i) => {
          const price = i.variant?.price || i.menuItemId?.price || 0;
          return s + price * (i.quantity || 0);
        }, 0) || 0;

      const taxRate = 0.05;
      const taxAmount = Number((subtotal * taxRate).toFixed(2));
      const deliveryCharge = subtotal >= 300 ? 0 : 30;
      const discount = order.discount || 0;
      const totalAmount = Number(
        (subtotal + taxAmount + deliveryCharge - discount).toFixed(2)
      );

      return sum + totalAmount;
    }, 0);

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: {
        orders: updatedOrders,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        grandTotal,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// update ststus and send mail
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
    ).populate("items.menuItemId", "name price");

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Send email only when order status is "delivered"
    if (orderStatus === "delivered") {
      // Fetch customer email
      let customerEmail = updatedOrder.deliveryAddress?.email;
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
          // Send email with template
          await sendOrderReceiptEmail(
            updatedOrder,
            customerEmail,
            customerName
          );
          console.log("Order receipt email sent to:", customerEmail);
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

// cancel User Order
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
      success: true,
      message: "Order cancelled successfully",
      data: cancelledOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to cancel user order",
      error: error.message,
    });
  }
};
