import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import { FoodMenu_Routes } from "./src/Routes/Food_menu.js";
import { Restorant_Routes } from "./src/Routes/Restaurant.js";
import { User_Routes } from "./src/Routes/User.js";
import { Order_Routes } from "./src/Routes/Order.js";
import { Review_Routes } from "./src/Routes/Review.js";
import connectDB from "./src/Config/Server.js";

// Env Confing
dotenv.config();
// Server Connected
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/user", User_Routes);
app.use("/menu", FoodMenu_Routes);
app.use("/restaurunt", Restorant_Routes);
app.use("/order", Order_Routes);
app.use("/review", Review_Routes);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
