import OrderSche from "../Models/OrderSch.js";
import User from "../Models/User.js";
import jwt from "jsonwebtoken";

// USer Register
export const UserRegistration = async (req, res) => {
  const {
    userName,
    Email,
    Password,
    MobileNo,
    DeliveryAddress,
    gender,
    DietaryPreferences,
  } = req.body;

  const existingUser = await User.findOne({ Email: Email });

  if (existingUser) {
    return res.status(400).json({ message: "User already Registered" });
  }

  try {
    const registerUser = await User.create({
      userName,
      Email,
      Password,
      MobileNo,
      DeliveryAddress,
      gender,
      DietaryPreferences,
      role: req.body.role || "customer",
    });

    res.status(201).json({
      message: "User Registration Successfully",
      data: registerUser,
    });
  } catch (error) {
    console.error("User Registration Error:", error);
    res.status(400).json({
      message: "Failed to User Registration",
      err: error.message,
    });
  }
};

// User Login
export const loginUser = async (req, res) => {
  const { Email, Password } = req.body;

  console.log(Email, Password);

  if (!Email || !Password) {
    return res.status(400).json({ message: "Email or Password are required!" });
  }

  try {
    const user = await User.findOne({ Email });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    if (user.Password !== Password) {
      return res.status(401).json({
        message: "Invalid Email or Password",
      });
    }

    const token = jwt.sign(
      { id: user._id, Email: user.Email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      success: true,
      message: "User login SuccessFully",
      token,
      user: {
        id: user._id,
        name: user.userName,
        email: user.Email,
        gender: user.gender,
        dietaryPreferences: user.DietaryPreferences,
        role: user.role,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed To User login", error: err.message });
  }
};

// getAll User by admin
export const getAllUser = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied." });
  }

  try {
    // Query params
    const { page = 1, limit = 10, search = "", status = "" } = req.query;

    // Filters
    const query = {};

    // Search by userName, email, phone etc.
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: "i" } },
        { Email: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by status if passed
    if (status) {
      query.status = status;
    }

    // Count total
    const totalUsers = await User.countDocuments(query);

    // Apply pagination
    const users = await User.find(query)
      .select("-password")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Users fetched successfully",
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: Number(page),
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// getUserById
export const userGetById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password"); // .selct password remove to show fetch times

    if (!user) {
      return res.status(404).json({
        message: "No User Found",
      });
    }

    // Get User All Orders
    const userOrders = await OrderSche.find({ userId: req.params.id })
      .populate("restaurantId", "name address")
      .populate("items.menuItemId", "name description price");

    res.status(200).json({
      success: true,
      message: "User & Orders fetched successfully",
      user: user,
      TotalOrder: userOrders.length,
      orders: userOrders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user with orders",
      error: error.message,
    });
  }
};

// Update User
export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    res.status(200).json({ message: "User Update SuccessFully!", data: user });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed To Update User", error: err.message });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    res.status(200).json({ message: "User Delete SuccessFully!", data: user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed To Delete User", error: err.message });
  }
};
