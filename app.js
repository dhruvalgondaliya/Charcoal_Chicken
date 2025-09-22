import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import helmet from "helmet";
import { FoodMenu_Routes } from "./src/Routes/Food_menu.js";
import { Restorant_Routes } from "./src/Routes/Restaurant.js";
import { User_Routes } from "./src/Routes/User.js";
import { Order_Routes } from "./src/Routes/Order.js";
import { Review_Routes } from "./src/Routes/Review.js";
import connectDB from "./src/Config/Server.js";
import { Cart_Routes } from "./src/Routes/Cart.js";
import { fileURLToPath } from "url";
import { UserProfile_Routes } from "./src/Routes/UserProfiles.js";
import { Dashboard_Routes } from "./src/Routes/Dashboard.js";
import { OrderReceipte_Routes } from "./src/Routes/downloadOrderReceipt.js";
import { Coupon_Route } from "./src/Routes/CouponCode.js";

// Env Confing
dotenv.config();

// Server Connected
connectDB();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());

// Static access for uploaded files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static access for uploaded files
app.use(
  "/uploads",
  express.static(path.join(__dirname, "src/uploads"), {
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

// Routes
app.use("/user", User_Routes);
app.use("/dashboard", Dashboard_Routes);
app.use("/receipt", OrderReceipte_Routes);
app.use("/menu", FoodMenu_Routes);
app.use("/coupon", Coupon_Route);
app.use("/restaurunt", Restorant_Routes);
app.use("/order", Order_Routes);
app.use("/review", Review_Routes);
app.use("/cart", Cart_Routes);
app.use("/userProfile", UserProfile_Routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
