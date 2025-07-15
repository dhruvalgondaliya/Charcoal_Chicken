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

} from "../Controllers/MainFood.js";


export const FoodMenu_Routes = express.Router();

// Create Routes
FoodMenu_Routes.post("/createMenu", createMenu);
FoodMenu_Routes.post("/:menuId/categories", CreateCategory);
FoodMenu_Routes.post("/:menuId/categories/:categoryId/items",addItemToCategory);

// Get Routes
FoodMenu_Routes.get("/getAllMenu", getAllMenus);
FoodMenu_Routes.get("/:menuId", getMenuById);


// Update/Delete Routes
FoodMenu_Routes.put("/:menuId/", updateMenu);
FoodMenu_Routes.put("/:menuId/categories/:categoryId", updateCategory);
FoodMenu_Routes.put("/:menuId/categories/:categoryId/items/:itemId",updateItemInCategory);

FoodMenu_Routes.delete("/:menuId", deleteMenu);
FoodMenu_Routes.delete("/:menuId/categories/:categoryId", deleteCategory);
FoodMenu_Routes.delete("/:menuId/categories/:categoryId/items/:itemId",deleteItemCategory);
