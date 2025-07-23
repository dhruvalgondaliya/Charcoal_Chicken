import express from "express";
import {
  createMenu,
  CreateCategory,
  addItemToCategory,
  updateCategory,
  updateItemInCategory,
  deleteCategory,
  deleteItemCategory,
  getAllMenus,
  getMenuById,
  deleteMenu,
  updateMenu,
  getCategoryById,
} from "../Controllers/MainFood.js";
import Auth from "../MiddleWare/Auth.js";
import upload from "../MiddleWare/Multer.js";

export const FoodMenu_Routes = express.Router();

// Create Routes
FoodMenu_Routes.post("/:restaurantId/createMenu", Auth, createMenu);
FoodMenu_Routes.post("/:menuId/categories", Auth, CreateCategory);
FoodMenu_Routes.post("/:menuId/categories/:categoryId/items", Auth, upload.single("image"), addItemToCategory);

// Get Routes
FoodMenu_Routes.get("/getAllMenu", getAllMenus);
FoodMenu_Routes.get("/:menuId", Auth, getMenuById);
FoodMenu_Routes.get("/:menuId/category", Auth, getCategoryById);

// Update/Delete Routes
FoodMenu_Routes.put("/:menuId/", Auth, updateMenu);
FoodMenu_Routes.put("/:menuId/categories/:categoryId", Auth, updateCategory);
FoodMenu_Routes.put("/:menuId/categories/:categoryId/items/:itemId", Auth, updateItemInCategory);

FoodMenu_Routes.delete("/:menuId", Auth, deleteMenu);
FoodMenu_Routes.delete("/:menuId/categories/:categoryId", Auth, deleteCategory);
FoodMenu_Routes.delete("/:menuId/categories/:categoryId/items/:itemId", Auth, deleteItemCategory);
