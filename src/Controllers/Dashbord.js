import mongoose from "mongoose";
import MenuSche from "../Models/Menu.js";
import CategorySche from "../Models/Category.js";
import ItemSche from "../Models/FoodItems.js";
import OrderSche from "../Models/OrderSch.js";
import restaurant from "../Models/Restaurant.js";
import User from "../Models/User.js";

// Super  Admin Api logic
export const getRestaurantStats = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied." });
  }
  try {
    // Count each status separately
    const [pending, approved, rejected, totalRestaurants] = await Promise.all([
      restaurant.countDocuments({ status: "pending" }),
      restaurant.countDocuments({ status: "approved" }),
      restaurant.countDocuments({ status: "rejected" }),
      restaurant.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      message: "Restaurant stats fetched successfully",
      data: {
        totalRestaurants,
        pending,
        approved,
        rejected,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant stats",
      error: error.message,
    });
  }
};

// get All User
export const getAllNewUSer = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied." });
  }
  try {
    const { range = "day" } = req.query;

    let groupFormat;
    if (range === "day") {
      groupFormat = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
      };
    } else if (range === "week") {
      groupFormat = {
        year: { $year: "$createdAt" },
        week: { $week: "$createdAt" },
      };
    } else if (range === "month") {
      groupFormat = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      };
    }

    const result = await User.aggregate([
      { $group: { _id: groupFormat, count: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Error fetching new users:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// get all restaurant new
export const getRestaurantsStats = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied." });
  }
  try {
    const { range = "day" } = req.query;

    let groupFormat;
    if (range === "day") {
      groupFormat = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
      };
    } else if (range === "month") {
      groupFormat = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      };
    } else if (range === "year") {
      groupFormat = {
        year: { $year: "$createdAt" },
      };
    }

    // 🔹 New restaurants by range
    const newRestaurants = await restaurant.aggregate([
      { $group: { _id: groupFormat, count: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // 🔹 Total restaurants (all time)
    const totalRestaurants = await restaurant.countDocuments();

    res.json({
      success: true,
      data: {
        newRestaurants,
        totalRestaurants,
      },
    });
  } catch (err) {
    console.error("Error fetching restaurants stats:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Total orders across all restaurants
export const getOrdersStats = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied." });
  }

  try {
    const { range = "day" } = req.query;

    let groupFormat;
    if (range === "day") {
      groupFormat = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
      };
    } else if (range === "month") {
      groupFormat = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      };
    } else {
      groupFormat = { year: { $year: "$createdAt" } };
    }

    // ✅ Orders breakdown by time range + restaurant
    const orders = await OrderSche.aggregate([
      {
        $addFields: {
          orderTotal: {
            $add: [
              {
                $sum: {
                  $map: {
                    input: "$items",
                    as: "item",
                    in: {
                      $multiply: [
                        "$$item.quantity",
                        {
                          $cond: [
                            { $ifNull: ["$$item.variant.price", false] },
                            "$$item.variant.price",
                            "$$item.price",
                          ],
                        },
                      ],
                    },
                  },
                },
              },
              { $ifNull: ["$taxAmount", 0] },
              { $ifNull: ["$deliveryCharge", 0] },
            ],
          },
        },
      },
      // ✅ Join with restaurants collection
      {
        $lookup: {
          from: "restaurants", // name of restaurants collection
          localField: "restaurantId",
          foreignField: "_id",
          as: "restaurant",
        },
      },
      { $unwind: "$restaurant" },
      {
        $group: {
          _id: {
            ...groupFormat, // day/month/year
            restaurant: "$restaurant.name", // add restaurant name
          },
          orderCount: { $sum: 1 },
          totalRevenue: { $sum: "$orderTotal" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // ✅ Overall stats for AOV
    const overallStats = await OrderSche.aggregate([
      {
        $addFields: {
          orderTotal: {
            $add: [
              {
                $sum: {
                  $map: {
                    input: "$items",
                    as: "item",
                    in: {
                      $multiply: [
                        "$$item.quantity",
                        {
                          $cond: [
                            { $ifNull: ["$$item.variant.price", false] },
                            "$$item.variant.price",
                            "$$item.price",
                          ],
                        },
                      ],
                    },
                  },
                },
              },
              { $ifNull: ["$taxAmount", 0] },
              { $ifNull: ["$deliveryCharge", 0] },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$orderTotal" },
        },
      },
    ]);

    const totalOrders = overallStats[0]?.totalOrders || 0;
    const avgOrderValue =
      totalOrders > 0 ? overallStats[0].totalRevenue / totalOrders : 0;

    res.json({
      success: true,
      data: {
        orders,
        totalOrders,
        avgOrderValue,
      },
    });
  } catch (err) {
    console.error("Error fetching orders stats:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// top selling restaurant
export const getRestaurantWiseSales = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied." });
  }

  try {
    const { range = "day" } = req.query;

    let groupFormat;
    if (range === "day") {
      groupFormat = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
        restaurantId: "$restaurantId",
      };
    } else if (range === "month") {
      groupFormat = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        restaurantId: "$restaurantId",
      };
    } else if (range === "year") {
      groupFormat = {
        year: { $year: "$createdAt" },
        restaurantId: "$restaurantId",
      };
    }

    const sales = await OrderSche.aggregate([
      // Calculate order total: subtotal + taxAmount + deliveryCharge
      {
        $addFields: {
          orderTotal: {
            $add: [
              {
                $sum: {
                  $map: {
                    input: "$items",
                    as: "item",
                    in: {
                      $multiply: [
                        "$$item.quantity",
                        {
                          $cond: [
                            { $ifNull: ["$$item.variant.price", false] },
                            "$$item.variant.price",
                            "$$item.price",
                          ],
                        },
                      ],
                    },
                  },
                },
              },
              { $ifNull: ["$taxAmount", 0] },
              { $ifNull: ["$deliveryCharge", 0] },
            ],
          },
        },
      },

      {
        $group: {
          _id: groupFormat,
          totalSales: { $sum: "$orderTotal" },
        },
      },

      // restaurant name get
      {
        $lookup: {
          from: "restaurants",
          localField: "_id.restaurantId",
          foreignField: "_id",
          as: "restaurant",
        },
      },
      { $unwind: "$restaurant" },

      {
        $project: {
          _id: 0,
          restaurantId: "$_id.restaurantId",
          restaurantName: "$restaurant.name",
          year: "$_id.year",
          month: "$_id.month",
          day: "$_id.day",
          totalSales: 1,
        },
      },
      { $sort: { year: 1, month: 1, day: 1 } },
    ]);

    res.json({ success: true, data: sales });
  } catch (err) {
    console.error("Error fetching restaurant sales:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =============================== Restaurant Admin Api Logic For Dashboard ====================
export const getDashboardStats = async (req, res) => {
  const { restaurantId } = req.params;

  try {
    if (!restaurantId) {
      return res.status(403).json({
        success: false,
        message: "Restaurant ID not found. Unauthorized access.",
      });
    }

    // Add filter by restaurantId
    const filter = { restaurantId };

    const [totalMenus, totalCategories, totalItems, totalOrders] =
      await Promise.all([
        MenuSche.countDocuments(filter),
        CategorySche.countDocuments(filter),
        ItemSche.countDocuments(filter),
        OrderSche.countDocuments(filter),
      ]);

    res.status(200).json({
      success: true,
      message: "Dashboard stats fetched successfully",
      data: {
        totalMenus,
        totalCategories,
        totalItems,
        totalOrders,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
      error: error.message,
    });
  }
};

// get Sale Chart IN Restaurant Admin show
export const getRestaurantSalesTrends = async (req, res) => {
  const { restaurantId } = req.params;
  const { range = "daily", startDate, endDate } = req.query;

  try {
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid restaurantId" });
    }

    const match = { restaurantId: new mongoose.Types.ObjectId(restaurantId) };

    // Exclude cancelled orders
    match.orderStatus = { $ne: "cancelled" };

    // Date filter
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        match.createdAt.$lte = end;
      }
    }
    // 📊 GroupId & sortStage
    let groupId, sortStage;
    if (range === "monthly") {
      groupId = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      };
      sortStage = { "_id.year": 1, "_id.month": 1 };
    } else if (range === "weekly") {
      groupId = {
        year: { $year: "$createdAt" },
        week: { $week: "$createdAt" },
      };
      sortStage = { "_id.year": 1, "_id.week": 1 };
    } else {
      // default daily
      groupId = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
      };
      sortStage = { "_id.year": 1, "_id.month": 1, "_id.day": 1 };
    }

    const salesData = await OrderSche.aggregate([
      { $match: match },
      {
        $project: {
          createdAt: 1,
          totalAmount: { $ifNull: ["$totalAmount", 0] },
        },
      },
      {
        $group: {
          _id: groupId,
          totalSales: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: sortStage },
    ]);

    res.json({ success: true, data: salesData });
  } catch (err) {
    console.error("Error in sales-trends:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Payment Chart
export const getPaymentMethodStats = async (req, res) => {
  const { restaurantId } = req.params;
  const { startDate, endDate } = req.query;

  try {
    const match = {
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
    };

    // Optional date filter
    if (startDate && !isNaN(Date.parse(startDate))) {
      match.createdAt = { ...match.createdAt, $gte: new Date(startDate) };
    }
    if (endDate && !isNaN(Date.parse(endDate))) {
      match.createdAt = { ...match.createdAt, $lte: new Date(endDate) };
    }

    const stats = await OrderSche.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          paymentMethod: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Payment method stats fetched successfully",
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch payment method stats",
      error: error.message,
    });
  }
};

// top sale Item APi
export const getTopSaleItems = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!restaurantId) {
      return res.status(400).json({ message: "restaurantId is required" });
    }

    const topItems = await OrderSche.aggregate([
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
          orderStatus: { $ne: "cancelled" },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.menuItemId",
          totalSold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      {
        $lookup: {
          from: "fooditems",
          localField: "_id",
          foreignField: "_id",
          as: "item",
        },
      },
      { $unwind: "$item" },
      {
        $project: {
          _id: 0,
          itemId: "$item._id",
          name: "$item.name",
          image: "$item.image",
          totalSold: 1,
        },
      },
    ]);

    res.json({
      message: "top selling Item Fetch SuccessFully",
      data: topItems,
    });
  } catch (error) {
    console.error("Error fetching top-selling items:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Orders by Category (Donut/Pie Chart Data)
export const getOrdersByCategory = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const data = await OrderSche.aggregate([
      { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId) } },
      { $unwind: "$items" },

      // Lookup food item details
      {
        $lookup: {
          from: "fooditems",
          localField: "items.menuItemId",
          foreignField: "_id",
          as: "foodItem",
        },
      },
      { $unwind: "$foodItem" },

      // Lookup category from foodItem.categoryId
      {
        $lookup: {
          from: "categories",
          localField: "foodItem.categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },

      // Group by category
      {
        $group: {
          _id: "$category.name",
          totalOrders: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
        },
      },
      { $sort: { totalOrders: -1 } },
    ]);

    res.status(200).json({
      success: true,
      message: "Orders grouped by category",
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
