import CategorySch from "../Models/Category.js";
import foodItemSch from "../Models/FoodItems.js";
import Menu from "../Models/Menu.js";
import mongoose from "mongoose";

// CREATE Menu
export const createMenu = async (req, res) => {
  const { restaurantId } = req.params;

  try {
    if (!restaurantId) {
      return res
        .status(400)
        .json({ message: "Please select a valid restaurant" });
    }

    const { title, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Menu title is required" });
    }

    // check for duplicate menu name in the same restaurant
    const existingMenu = await Menu.findOne({
      restaurantId,
      title: { $regex: new RegExp(`^${title.trim()}$`, "i") },
    });

    if (existingMenu) {
      return res.status(400).json({ message: "Menu name already exists" });
    }

    const menu = await Menu.create({
      restaurantId,
      title: title.trim(),
      description,
    });

    res.status(201).json({
      message: "Menu created successFully",
      data: menu,
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to create menu",
      message: err.message,
    });
  }
};

// Create Category
export const CreateCategory = async (req, res) => {
  const { menuId } = req.params;
  let { name, description } = req.body;

  try {
    const menu = await Menu.findById(menuId);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    // Normalize name
    name = name.trim().toLowerCase();

    // Check if a category with the same name exists under the same restaurant
    const existingCategory = await CategorySch.findOne({
      restaurantId: menu.restaurantId,
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingCategory) {
      return res.status(400).json({
        message: "Category name already exists",
      });
    }

    const newCategory = new CategorySch({
      name,
      description,
      menuId: menu._id,
      restaurantId: menu.restaurantId,
      items: [],
    });

    await newCategory.save();

    // Add to menu's categories
    menu.categories.push(newCategory._id);
    await menu.save();

    res.status(201).json({
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to create category",
      message: err.message,
    });
  }
};

// Create Category Items
export const addItemToCategory = async (req, res) => {
  const { menuId, categoryId } = req.params;

  try {
    // Validate menu and category
    const menu = await Menu.findById(menuId);
    if (!menu) return res.status(404).json({ message: "Menu not found" });

    if (!menu.categories.includes(categoryId)) {
      return res
        .status(400)
        .json({ message: "Category does not belong to the menu" });
    }

    const category = await CategorySch.findById(categoryId);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const itemData = {
      ...req.body,
      imageUrl,
      restaurantId: menu.restaurantId,
      categoryId: categoryId,
    };

    // Create and save the item
    const newItem = new foodItemSch(itemData);
    await newItem.save();

    category.items.push(newItem._id);
    await category.save();

    res.status(201).json({
      message: "Item created successfully",
      data: newItem,
    });
  } catch (err) {
    console.error("Error creating item:", err);
    res.status(500).json({ error: "Failed to create item", err: err.message });
  }
};

// GET AllMenu
export const getAllMenus = async (req, res) => {
  try {
    const menus = await Menu.find().populate({
      path: "categories",
      populate: { path: "items" },
    });

    console.log("testing fetch category", menus[0].categories);

    res.status(200).json({
      message: "All Menus fetched successfully",
      totalMenus: menus.length,
      data: menus,
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch all menus",
      errorMessage: err.message,
    });
  }
};

// get particular Restaurant menu
export const getMenusByRestaurant = async (req, res) => {
  const { restaurantId } = req.params;
  const { search = "", page = 1, limit = 10 } = req.query;

  try {
    const query = {
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
    };

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const totalMenus = await Menu.countDocuments(query);
    const totalPages = Math.ceil(totalMenus / limit);
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const menus = await Menu.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: "categories",
        populate: { path: "items" },
      });

    res.status(200).json({
      message: "Menus fetched successfully",
      totalMenus,
      currentPage: parseInt(page),
      totalPages,
      data: menus,
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch menus for the restaurant",
      message: err.message,
    });
  }
};

// get restaurant menu name
export const getMenuNamesByRestaurant = async (req, res) => {
  const { restaurantId } = req.params;

  try {
    if (!restaurantId) {
      return res.status(400).json({ error: "Restaurant ID is required" });
    }

    const menus = await Menu.find(
      { restaurantId: new mongoose.Types.ObjectId(restaurantId) },
      { _id: 1, title: 1 }
    );

    res.status(200).json({
      message: "Menu names fetched successfully",
      data: menus,
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch menu names",
      message: err.message,
    });
  }
};

// get particular Restaurant Category
export const getRestaurantCategories = async (req, res) => {
  const { restaurantId } = req.params;
  const { search = "", page = 1, limit = 10 } = req.query;

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skip = (pageNumber - 1) * limitNumber;

  try {
    // Build query with search and restaurantId
    const query = {
      restaurantId,
      name: { $regex: search, $options: "i" },
    };

    // Count total matching categories
    const totalCategories = await CategorySch.countDocuments(query);

    // Fetch paginated categories
    const categories = await CategorySch.find(query)
      .populate("menuId", "title")
      .populate("items")
      .skip(skip)
      .limit(limitNumber);

    // Get the menu for the restaurant
    const menu = await Menu.findOne({ restaurantId });
    if (!menu) {
      return res
        .status(404)
        .json({ message: "Menu not found for this restaurant" });
    }

    // Attach menuName to each category
    const categoriesWithMenuName = categories.map((cat) => ({
      ...cat.toObject(),
      menuName: menu.name,
    }));

    res.status(200).json({
      message: "Categories fetched successfully",
      totalCategories,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCategories / limitNumber),
      data: categoriesWithMenuName || [],
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch categories for the restaurant",
      message: err.message,
    });
  }
};

// get restaurant Category Name
export const getCategoryNamesByRestaurant = async (req, res) => {
  const { restaurantId } = req.params;

  try {
    if (!restaurantId) {
      return res.status(400).json({ error: "Restaurant ID is required" });
    }

    const categories = await CategorySch.find(
      { restaurantId },
      { _id: 1, name: 1 }
    ).populate("menuId", "title");

    res.status(200).json({
      message: "Category names fetched successfully",
      data: categories,
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch category names",
      message: err.message,
    });
  }
};

// get particular Restaurant Items
export const getItemsByRestaurant = async (req, res) => {
  const { restaurantId } = req.params;
  const { search = "", page = 1, limit = 10 } = req.query;

  try {
    const query = {
      restaurantId,
      $or: [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ],
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const itemsPromise = foodItemSch
      .find(query)
      .populate("categoryId", "name")
      .skip(skip)
      .limit(parseInt(limit));
    const totalPromise = foodItemSch.countDocuments(query);

    const [items, total] = await Promise.all([itemsPromise, totalPromise]);

    res.status(200).json({
      message: "Items fetched successfully",
      data: items,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ error: "Failed to fetch items", err: err.message });
  }
};

// Get a menu by ID
export const getMenuById = async (req, res) => {
  try {
    if (!menu) return res.status(404).json({ message: "Menu not found" });
    const menu = await Menu.findById(req.params.menuId).populate({
      path: "categories",
      populate: { path: "items" },
    });

    res.status(200).json({
      message: "Menu fetched by ID successfully",
      data: menu,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch menu by ID", err: err.message });
  }
};

// Get Category ById
export const getCategoryById = async (req, res) => {
  const { menuId } = req.params;

  try {
    const category = await Menu.findById(menuId).populate({
      path: "categories",
      populate: { path: "items" },
    });

    if (!category) {
      return res.status(404).json({ messages: "category Not Found" });
    }

    res.status(200).json({
      success: true,
      message: "Category Fetch By Id SuccessFully",
      totalCategory: category.length,
      data: category,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to Fetch Category",
      error: err.message,
    });
  }
};

// UPDATE a menu by ID
export const updateMenu = async (req, res) => {
  try {
    const menu = await Menu.findByIdAndUpdate(req.params.menuId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!menu) return res.status(404).json({ message: "Menu not found" });

    res.status(200).json({ message: "Menu updated successfully", data: menu });
  } catch (err) {
    res.status(500).json({ error: "Failed to update menu", err: err.message });
  }
};

// Update Category
export const updateCategory = async (req, res) => {
  const { menuId, categoryId } = req.params;
  const updates = req.body;

  try {
    const menu = await Menu.findById(menuId).populate("categories");
    if (!menu) return res.status(404).json({ message: "Menu not found" });

    // Find category by ID
    const category = menu.categories.find(
      (cat) => cat._id.toString() === categoryId
    );

    if (!category)
      return res.status(404).json({ message: "Category not found" });

    const newCategory = await CategorySch.findByIdAndUpdate(
      categoryId,
      updates,
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Category updated successfully", data: newCategory });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to update category", err: err.message });
  }
};

// update ItemCtegory
export const updateItemInCategory = async (req, res) => {
  const { menuId, categoryId, itemId } = req.params;

  try {
    // Check if menu exists
    const menu = await Menu.findById(menuId);
    if (!menu) return res.status(404).json({ message: "Menu not found" });

    // Check if category belongs to this menu
    const hasCategory = menu.categories.some(
      (catId) => catId.toString() === categoryId
    );
    if (!hasCategory) {
      return res
        .status(404)
        .json({ message: "Category does not belong to the menu" });
    }

    // Check category exists
    const category = await CategorySch.findById(categoryId);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    // Check item belongs to this category
    const hasItem = category.items.some((id) => id.toString() === itemId);
    if (!hasItem)
      return res
        .status(404)
        .json({ message: "Item not found in this category" });

    // Extract values from body
    const { name, description, price, hasVariants } = req.body;

    const updatedData = {
      name,
      description,
      hasVariants: hasVariants === "true" || hasVariants === true,
    };

    // Handle variants
    if (updatedData.hasVariants) {
      let parsedVariants = [];

      if (Array.isArray(req.body.variants)) {
        // JSON array case
        parsedVariants = req.body.variants.map((v) => ({
          size: v.size,
          price: parseFloat(v.price || 0),
        }));
      } else {
        // Form-data case
        let i = 0;
        while (req.body[`variants[${i}][size]`]) {
          parsedVariants.push({
            size: req.body[`variants[${i}][size]`],
            price: parseFloat(req.body[`variants[${i}][price]`] || "0"),
          });
          i++;
        }
      }

      updatedData.variants = parsedVariants;
    } else {
      updatedData.price = parseFloat(price || "0");
    }

    // Handle AddOns
    if (Array.isArray(req.body.addOns)) {
      updatedData.addOns = req.body.addOns.map((a) => ({
        name: a.name,
        price: parseFloat(a.price || 0),
      }));
    } else if (req.body["addOns[0][name]"]) {
      let j = 0;
      const parsedAddOns = [];
      while (req.body[`addOns[${j}][name]`]) {
        parsedAddOns.push({
          name: req.body[`addOns[${j}][name]`],
          price: parseFloat(req.body[`addOns[${j}][price]`] || "0"),
        });
        j++;
      }
      updatedData.addOns = parsedAddOns;
    }

    // Handle image upload
    if (req.file) {
      updatedData.imageUrl = `/uploads/${req.file.filename}`;
    }

    // Update item in
    const updatedItem = await foodItemSch.findByIdAndUpdate(
      itemId,
      updatedData,
      { new: true }
    );

    if (!updatedItem)
      return res.status(404).json({ message: "Item not found in DB" });

    res.status(200).json({
      message: "Item updated successfully",
      data: updatedItem,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update item",
      err: err.message,
    });
  }
};

// DELETE menu
export const deleteMenu = async (req, res) => {
  try {
    const menu = await Menu.findByIdAndDelete(req.params.menuId);

    if (!menu) return res.status(404).json({ message: "Menu not found" });

    res.status(200).json({ message: "Menu deleted successfully", data: menu });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to delete menu", error: err.messages });
  }
};

// DELETE Category
export const deleteCategory = async (req, res) => {
  const { menuId, categoryId } = req.params;

  try {
    const menu = await Menu.findById(menuId);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    // Remove category reference from menu
    menu.categories = menu.categories.filter(
      (id) => id.toString() !== categoryId
    );
    await menu.save();

    // Delete the actual category
    await CategorySch.findByIdAndDelete(categoryId);

    res.status(200).json({
      message: "Category deleted successfully",
      data: menu,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete category",
      error: err.message,
    });
  }
};

// DELETE Category Item
export const deleteItemCategory = async (req, res) => {
  const { categoryId, itemId } = req.params;

  try {
    const category = await CategorySch.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const deletedItem = await foodItemSch.findByIdAndDelete(itemId);
    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Remove the item from category.items if 
    category.items.pull(new mongoose.Types.ObjectId(itemId));
    await category.save();

    res.status(200).json({
      message: "Item deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting item from category:", err);
    res.status(500).json({
      message: "Failed to delete item",
      error: err.message,
    });
  }
};
