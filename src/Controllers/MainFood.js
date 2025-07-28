import CategorySch from "../Models/Category.js";
import foodItemSch from "../Models/FoodItems.js";
import Menu from "../Models/Menu.js";

// CREATE Menu
export const createMenu = async (req, res) => {
  const { restaurantId } = req.params;

  try {
    if (!restaurantId) {
      return res
        .status(404)
        .json({ message: "Please Selecet A Valid Restaurant" });
    }

    const menu = await Menu.create({
      restaurantId,
      ...req.body,
    });

    res.status(201).json({
      message: "Menu created successfully",
      data: menu,
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to create menu",
      err: err.message,
    });
  }
};

// Create Category
export const CreateCategory = async (req, res) => {
  const { menuId } = req.params;
  const { name, description } = req.body;

  try {
    const menu = await Menu.findById(menuId);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    // Get the restaurantId from the menu
    const restaurantId = menu.restaurantId;

    const newCategory = new CategorySch({
      name,
      description,
      menuId: menu._id,
      restaurantId: restaurantId,
      items: [],
    });

    await newCategory.save();

    // Push to menu
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
    // Step 1: Validate menu and category
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

    const itemData = {
      ...req.body,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : "",
    };

    console.log("File uploaded:", req.file);
    console.log("testing body data", image);

    // Step 3: Create and save the item
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

    res.status(200).json({
      message: "All Menu Fetch SuccessFully",
      TotalData: menus.length,
      data: menus,
      category: menus.categories,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch all menus", error: err.message });
  }
};

// get particular Restaurant menu
export const getMenusByRestaurant = async (req, res) => {
  const { restaurantId } = req.params;

  try {
    const menus = await Menu.find({ restaurantId }).populate({
      path: "categories",
      populate: { path: "items" },
    });

    res.status(200).json({
      message: "Menu fetched successfully",
      totalMenus: menus.length,
      data: menus,
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch menus for the restaurant",
      message: err.message,
    });
  }
};

// get particular Restaurant Category
export const getRestaurantCategories = async (req, res) => {
  const { restaurantId } = req.params;

  try {
    const categories = await CategorySch.find({ restaurantId }).populate(
      "items"
    );

    // Find the menu belonging to this restaurant
    const menu = await Menu.findOne({ restaurantId });

    if (!menu) {
      return res
        .status(404)
        .json({ message: "Menu not found for this restaurant" });
    }

    // Attach menuId to each category
    const categoriesWithMenuId = categories.map((cat) => ({
      ...cat.toObject(),
      menuId: menu._id,
    }));

    res.status(200).json({
      message: "Categories fetched successfully",
      totalCategories: categories.length,
      data: categoriesWithMenuId,
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch categories for the restaurant",
      message: err.message,
    });
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
  const updates = req.body;

  try {
    const menu = await Menu.findById(menuId);
    if (!menu) return res.status(404).json({ message: "Menu not found" });

    const hasCategory = menu.categories.some(
      (catId) => catId.toString() === categoryId
    );

    if (!hasCategory)
      return res
        .status(404)
        .json({ message: "Category does not belong to the menu" });

    const category = await CategorySch.findById(categoryId);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    // Check if item exists in category.items
    const hasItem = category.items.some((item) => item.toString() === itemId);

    if (!hasItem)
      return res
        .status(404)
        .json({ message: "Item not found in this category" });

    const updatedItem = await foodItemSch.findByIdAndUpdate(itemId, updates, {
      new: true,
    });

    if (!updatedItem)
      return res.status(404).json({ message: "Item not found in database" });

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
  const { menuId, categoryId, itemId } = req.params;

  try {
    const menu = await Menu.findById(menuId);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    const categoryLinked = menu.categories.some(
      (catId) => catId.toString() === categoryId
    );

    if (!categoryLinked) {
      return res
        .status(400)
        .json({ message: "Category does not belong to the menu" });
    }

    const category = await CategorySch.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: messages.category.notFound });
    }

    const itemLinked = category.items.some((id) => id.toString() === itemId);

    if (!itemLinked) {
      return res.status(404).json({ message: "Item not found" });
    }

    category.items.pull(itemId);

    await category.save();

    res.status(200).json({
      message: "Item deleted successfully",
      data: category,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete item",
      error: err.message,
    });
  }
};
