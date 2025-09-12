import mongoose from "mongoose";
import MenuSche from "../Models/Menu.js";
import CategorySche from "../Models/Category.js";
import ItemSche from "../Models/FoodItems.js";
import OrderSche from "../Models/OrderSch.js";
import restaurant from "../Models/Restaurant.js";
import User from "../Models/User.js";

// Super  Admin Api logic
export const getRestaurantStats = async (req, res) => {
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
export const getAllNewUser = async (req, res) => {
  try {
    const { range = "day" } = req.query;

    let matchStage = {};
    let groupFormat = {};
    let sortStage = {};
    let limit = 0;

    if (range === "day") {
      // last 30 days
      const date = new Date();
      date.setDate(date.getDate() - 30);
      matchStage = { createdAt: { $gte: date } };

      groupFormat = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
      };

      sortStage = { "_id.year": 1, "_id.month": 1, "_id.day": 1 };
    } else if (range === "month") {
      // last 12 months
      const date = new Date();
      date.setMonth(date.getMonth() - 12);
      matchStage = { createdAt: { $gte: date } };

      groupFormat = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      };

      sortStage = { "_id.year": 1, "_id.month": 1 };
    } else if (range === "year") {
      groupFormat = {
        year: { $year: "$createdAt" },
      };

      sortStage = { "_id.year": 1 };
    } else {
      return res.status(400).json({ success: false, message: "Invalid range" });
    }

    const result = await User.aggregate([
      { $match: matchStage },
      { $group: { _id: groupFormat, count: { $sum: 1 } } },
      { $sort: sortStage },
    ]);

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Error fetching new users:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// get all restaurant new
export const getRestaurantsStats = async (req, res) => {
  try {
    const { range = "day" } = req.query;

    let matchStage = {};
    let groupFormat = {};
    let sortStage = {};

    if (range === "day") {
      // last 30 days
      const date = new Date();
      date.setDate(date.getDate() - 30);
      matchStage = { createdAt: { $gte: date } };

      groupFormat = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
      };

      sortStage = { "_id.year": 1, "_id.month": 1, "_id.day": 1 };
    } else if (range === "month") {
      // last 12 months
      const date = new Date();
      date.setMonth(date.getMonth() - 12);
      matchStage = { createdAt: { $gte: date } };

      groupFormat = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      };

      sortStage = { "_id.year": 1, "_id.month": 1 };
    } else if (range === "year") {
      // all years
      groupFormat = {
        year: { $year: "$createdAt" },
      };

      sortStage = { "_id.year": 1 };
    } else {
      return res.status(400).json({ success: false, message: "Invalid range" });
    }

    // 🔹 New restaurants grouped by range
    const newRestaurants = await restaurant.aggregate([
      { $match: matchStage },
      { $group: { _id: groupFormat, count: { $sum: 1 } } },
      { $sort: sortStage },
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
  try {
    const { range = "day" } = req.query;

    let matchStage = {};
    let groupFormat = {};
    let sortStage = {};

    if (range === "day") {
      // Last 30 days
      const date = new Date();
      date.setDate(date.getDate() - 7);
      matchStage = { createdAt: { $gte: date } };

      groupFormat = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
      };

      sortStage = { "_id.year": 1, "_id.month": 1, "_id.day": 1 };
    } else if (range === "month") {
      // Last 12 months
      const date = new Date();
      date.setMonth(date.getMonth() - 12);
      matchStage = { createdAt: { $gte: date } };

      groupFormat = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      };

      sortStage = { "_id.year": 1, "_id.month": 1 };
    } else {
      // Yearly
      groupFormat = {
        year: { $year: "$createdAt" },
      };

      sortStage = { "_id.year": 1 };
    }

    // Orders breakdown by time range + restaurant
    const orders = await OrderSche.aggregate([
      { $match: matchStage },
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
      // Join with restaurants collection
      {
        $lookup: {
          from: "restaurants",
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
            restaurant: "$restaurant.name",
          },
          orderCount: { $sum: 1 },
          totalRevenue: { $sum: "$orderTotal" },
        },
      },
      { $sort: sortStage },
    ]);

    // Overall stats for AOV
    const overallStats = await OrderSche.aggregate([
      { $match: matchStage },
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
  try {
    const { range = "day" } = req.query;

    let matchStage = {};
    let groupFormat = {};
    let labelExpr = {};

    if (range === "day") {
      const date = new Date();
      date.setDate(date.getDate() - 7);
      matchStage = { createdAt: { $gte: date } };

      groupFormat = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
        restaurantId: "$restaurantId",
      };

      labelExpr = {
        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
      };
    } else if (range === "month") {
      const date = new Date();
      date.setMonth(date.getMonth() - 12);
      matchStage = { createdAt: { $gte: date } };

      groupFormat = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        restaurantId: "$restaurantId",
      };

      labelExpr = {
        $dateToString: { format: "%Y-%m", date: "$createdAt" },
      };
    } else {
      groupFormat = {
        year: { $year: "$createdAt" },
        restaurantId: "$restaurantId",
      };

      labelExpr = { $toString: "$year" };
    }

    const sales = await OrderSche.aggregate([
      { $match: matchStage },

      {
        $group: {
          _id: groupFormat,
          totalSales: { $sum: "$totalAmount" },
          lastOrder: { $max: "$createdAt" },
        },
      },

      // Join restaurant details
      {
        $lookup: {
          from: "restaurants",
          let: { restoId: "$_id.restaurantId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", { $toObjectId: "$$restoId" }] },
              },
            },
          ],
          as: "restaurant",
        },
      },

      {
        $project: {
          _id: 0,
          restaurantId: "$_id.restaurantId",
          restaurantName: "$restaurant.name",
          year: "$_id.year",
          month: "$_id.month",
          day: "$_id.day",
          totalSales: 1,
          lastOrder: 1,
          label: labelExpr,
        },
      },

      // Sort by sales (highest first) then by latest order
      { $sort: { totalSales: -1, lastOrder: -1 } },

      // Limit to top 4 restaurants
      { $limit: 4 },
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
  const { range = "day" } = req.query;

  try {
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid restaurantId" });
    }

    const match = {
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
    };
    match.orderStatus = { $ne: "cancelled" };

    let groupId;
    let projectId;

    if (range === "month") {
      groupId = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      };
      projectId = {
        _id: 0,
        month: {
          $concat: [
            { $toString: "$_id.year" },
            "-",
            {
              $cond: [
                { $lt: ["$_id.month", 10] },
                { $concat: ["0", { $toString: "$_id.month" }] },
                { $toString: "$_id.month" },
              ],
            },
          ],
        },

        totalSales: 1,
        orders: 1,
      };
    } else if (range === "year") {
      groupId = { year: { $year: "$createdAt" } };
      projectId = { _id: 0, year: "$_id.year", totalSales: 1, orders: 1 };
    } else {
      // daily
      groupId = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
      };
      projectId = {
        _id: 0,
        date: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: {
              $dateFromParts: {
                year: "$_id.year",
                month: "$_id.month",
                day: "$_id.day",
              },
            },
          },
        },
        totalSales: 1,
        orders: 1,
      };
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
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      { $project: projectId },
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
  const { range = "day" } = req.query;

  try {
    let dateFormat = {};
    if (range === "day") {
      dateFormat = {
        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
      };
    } else if (range === "month") {
      dateFormat = { $dateToString: { format: "%m-%Y", date: "$createdAt" } };
    } else if (range === "year") {
      dateFormat = { $dateToString: { format: "%Y", date: "$createdAt" } };
    }

    const stats = await OrderSche.aggregate([
      { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId) } },
      {
        $group: {
          _id: {
            paymentMethod: "$paymentMethod",
            period: dateFormat, // day, month, or year
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          paymentMethod: "$_id.paymentMethod",
          period: "$_id.period",
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
    const { range } = req.query;

    if (!restaurantId) {
      return res.status(400).json({ message: "restaurantId is required" });
    }

    let groupStage = {};
    let sortStage = {};
    let limitStage = {};

    if (range === "day") {
      // Last 30 days
      groupStage = {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
          itemId: "$items.menuItemId",
        },
        totalSold: { $sum: "$items.quantity" },
      };
      sortStage = { "_id.year": -1, "_id.month": -1, "_id.day": -1 };
      limitStage = { $limit: 30 };
    } else if (range === "month") {
      // Last 12 months
      groupStage = {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          itemId: "$items.menuItemId",
        },
        totalSold: { $sum: "$items.quantity" },
      };
      sortStage = { "_id.year": -1, "_id.month": -1 };
      limitStage = { $limit: 12 };
    } else if (range === "year") {
      // Year-wise
      groupStage = {
        _id: {
          year: { $year: "$createdAt" },
          itemId: "$items.menuItemId",
        },
        totalSold: { $sum: "$items.quantity" },
      };
      sortStage = { "_id.year": -1 };
    }

    const topItems = await OrderSche.aggregate([
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
          orderStatus: { $ne: "cancelled" },
        },
      },
      { $unwind: "$items" },
      { $group: groupStage },
      { $sort: sortStage },
      ...(range !== "year" ? [limitStage] : []),
      {
        $lookup: {
          from: "fooditems",
          localField: "_id.itemId",
          foreignField: "_id",
          as: "item",
        },
      },
      { $unwind: "$item" },
      {
        $project: {
          _id: 0,
          date: "$_id",
          itemId: "$item._id",
          name: "$item.name",
          image: "$item.image",
          day: "$_id.day",
          totalSold: 1,
        },
      },
    ]);

    res.json({
      success: true,
      message: `Top selling items (${range}-wise) fetched successfully`,
      data: topItems,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get Orders by Category
export const getOrdersByCategory = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { range } = req.query;

    const groupId = {
      category: "$category.name",
    };

    if (range === "day") {
      groupId.date = {
        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
      };
    } else if (range === "month") {
      groupId.date = {
        $dateToString: { format: "%Y-%m", date: "$createdAt" },
      };
    } else if (range === "year") {
      groupId.date = {
        $dateToString: { format: "%Y", date: "$createdAt" },
      };
    }

    const data = await OrderSche.aggregate([
      { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId) } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "fooditems",
          localField: "items.menuItemId",
          foreignField: "_id",
          as: "foodItem",
        },
      },
      { $unwind: "$foodItem" },
      {
        $lookup: {
          from: "categories",
          localField: "foodItem.categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },

      {
        $group: {
          _id: groupId,
          totalOrders: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
        },
      },
      { $sort: { totalOrders: -1 } },
      { $limit: 2 },
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
