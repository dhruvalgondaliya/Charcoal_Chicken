import MenuSche from "../models/Menu.js";
import CategorySche from "../models/Category.js";
import ItemSche from "../Models/FoodItems.js";
import OrderSche from "../Models/OrderSch.js";
import restaurant from "../Models/Restaurant.js";

export const getDashboardStats = async (req, res) => {
  try {
    // Count totals in parallel for better performance
    const [totalMenus, totalCategories, totalItems, totalOrders] =
      await Promise.all([
        MenuSche.countDocuments(),
        CategorySche.countDocuments(),
        ItemSche.countDocuments(),
        OrderSche.countDocuments(),
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
