import restaurant from "../Models/Restaurant.js";
import jwt from "jsonwebtoken";
import {
  approvalEmailTemplate,
  rejectionEmailTemplate,
} from "../templates/EmailStatusMail.js";
import { sendMail } from "../services/emailService.js";

// Create Restaurant
export const createRestaurant = async (req, res) => {
  const { name, ownerName, email, Password, phone, address, cuisines } =
    req.body;
  try {
    const existingResto = await restaurant.findOne({ email: req.body.email });

    if (existingResto) {
      return res.status(400).json({ message: "Restaurant already registered" });
    }

    const newResto = await restaurant.create({
      name,
      ownerName,
      email,
      Password,
      phone,
      address,
      cuisines,
    });

    res.status(201).json({
      message: "Restaurant Created Successfully!",
      data: newResto,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to Create Restaurant",
      error: error.message,
    });
  }
};

// login for Restaurant
export const loginRestaurant = async (req, res) => {
  const { email, password } = req.body;

  try {
    const resto = await restaurant.findOne({ email: email });
    console.log("testing for email:", resto);

    if (!resto) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // ✅ Check approval status
    if (resto.status === "pending") {
      return res.status(403).json({
        message: "Your request is still pending approval by admin.",
      });
    }

    if (resto.status === "rejected") {
      return res.status(403).json({
        message: "Your restaurant registration has been rejected.",
      });
    }

    // ✅ Check password
    if (resto.Password !== password) {
      return res.status(401).json({
        message: "Invalid Email or Password",
      });
    }

    const token = jwt.sign(
      { id: resto._id, role: resto.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      restaurant: {
        id: resto._id,
        name: resto.name,
        email: resto.email,
        role: resto.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// get all Restaurants for admin fetch
export const getAllRestaurants = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied." });
    }

    const restaurants = await restaurant.find().select("-Password");
    res.status(200).json(restaurants);
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//Restaurant GetById
export const RestoFindById = async (req, res) => {
  try {
    const getResto = await restaurant.findById(req.params.id);

    if (!getResto) {
      return res.status(404).json({ message: "Restaurant Not Found" });
    }

    res.status(200).json({
      message: "Restaurant Fetch By Id Successfully",
      data: getResto,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed To Fetch Restaurant By Id ",
      error: error.message,
    });
  }
};

// Approve restaurant
export const approveRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const resto = await restaurant.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true }
    );

    if (!resto) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Send approval email
    await sendMail(
      resto.email,
      "Restaurant Approval Notification",
      "Your restaurant has been approved!",
      approvalEmailTemplate(resto.name, resto.ownerName)
    );

    res
      .status(200)
      .json({ message: "Restaurant approved successfully", resto });
  } catch (error) {
    console.error("Error approving restaurant:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reject restaurant
export const rejectRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const resto = await restaurant.findByIdAndUpdate(
      id,
      { status: "rejected" },
      { new: true }
    );

    if (!resto) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Send rejection email
    const emailContent = rejectionEmailTemplate(resto.name, resto.ownerName);

    await sendMail(
      resto.email,
      "Restaurant Application Update",
      "Your restaurant application has been reviewed",
      emailContent
    );

    res
      .status(200)
      .json({ message: "Restaurant rejected successfully", resto });
  } catch (error) {
    console.error("Error rejecting restaurant:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Restaurant
export const updateRestaurant = async (req, res) => {
  try {
    const Resto = await restaurant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!Resto) {
      return res.status(404).json({
        message: "Restaurant Not Found",
      });
    }
    res.status(200).json({
      message: "Restaurant Update SuccessFully!",
      data: Resto,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed To Update Restaurant",
      error: error.message,
    });
  }
};

// Delete Restaurant
export const deleteRestaurant = async (req, res) => {
  try {
    const Resto = await restaurant.findByIdAndDelete(req.params.id);

    if (!Resto) {
      return res.status(404).json({
        message: "Restaurant Not Found",
      });
    }
    res.status(200).json({
      message: "Restaurant Delete SuccessFully!",
      data: Resto,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed To Delete Restaurant",
      error: error.message,
    });
  }
};
