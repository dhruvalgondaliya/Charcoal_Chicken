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
  getMenusByRestaurant,
  getRestaurantCategories,
} from "../Controllers/MainFood.js";
import Auth from "../MiddleWare/Auth.js";
import { authorizeRoles } from "../MiddleWare/authorizeRoles.js";
import upload from "../MiddleWare/Multer.js";

export const FoodMenu_Routes = express.Router();

// Create Routes
FoodMenu_Routes.post("/:restaurantId/createMenu", Auth, createMenu);
FoodMenu_Routes.post("/:menuId/categories", Auth, CreateCategory);
FoodMenu_Routes.post(
  "/:menuId/categories/:categoryId/items",
  Auth,
  upload.single("image"),
  addItemToCategory
);

// Get Routes
FoodMenu_Routes.get("/getAllMenu", getAllMenus);
FoodMenu_Routes.get("/:menuId", Auth, getMenuById);
FoodMenu_Routes.get("/:menuId/category", Auth, getCategoryById);
FoodMenu_Routes.get("/restaurant/:restaurantId/menus", getMenusByRestaurant); // get particular Restaurant menu fetch
FoodMenu_Routes.get(
  "/restaurants/:restaurantId/categories",
  getRestaurantCategories
); // get particular Restaurant Category Fetch fetch

// Update/Delete Routes
FoodMenu_Routes.put("/:menuId/", Auth, updateMenu);
FoodMenu_Routes.put(
  "/:menuId/categories/:categoryId",
  Auth,
  authorizeRoles(["admin"]),
  updateCategory
);
FoodMenu_Routes.put(
  "/:menuId/categories/:categoryId/items/:itemId",
  Auth,
  authorizeRoles(["admin"]),
  updateItemInCategory
);

FoodMenu_Routes.delete("/:menuId", Auth, deleteMenu);
FoodMenu_Routes.delete("/:menuId/categories/:categoryId", Auth, deleteCategory);
FoodMenu_Routes.delete(
  "/:menuId/categories/:categoryId/items/:itemId",
  Auth,
  deleteItemCategory
);
