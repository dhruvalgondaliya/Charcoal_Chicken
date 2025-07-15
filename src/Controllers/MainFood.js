import CategorySch from "../Models/Category.js";
import foodItemSch from "../Models/FoodItems.js";
import Menu from "../models/Menu.js";
import messages from "../Utiles/Message.js";

// CREATE Menu
export const createMenu = async (req, res) => {
  try {
    const menu = await Menu.create(req.body);

    res.status(201).json({
      message: messages.menu.createSuccess,
      data: menu,
    });
  } catch (err) {
    res.status(500).json({ error: messages.menu.createFail, err: err.message });
  }
};

// Create Category
export const CreateCategory = async (req, res) => {
  const { menuId } = req.params;
  const { name, description } = req.body;

  try {
    const menu = await Menu.findById(menuId);
    if (!menu) return res.status(404).json({ message: messages.menu.notFound });

    const newCategory = new CategorySch({
      name,
      description,
      items: [],
    });

    await newCategory.save();

    menu.categories.push(newCategory._id);

    // Save the updated Menu
    await menu.save();

    res
      .status(201)
      .json({ message: messages.category.createSuccess, data: newCategory });

  } catch (err) {
    res
      .status(500)
      .json({ error: messages.category.createFail, err: err.message });
  }
};


// Create Category Items
export const addItemToCategory = async (req, res) => {
  const { menuId, categoryId } = req.params;

  const itemData = req.body;

  try {
    const menu = await Menu.findById(menuId);
    if (!menu) return res.status(404).json({ message: messages.menu.notFound });

    if (!menu.categories.includes(categoryId)) {
      return res.status(400).json({ message: messages.category.notInMenu });
    }

    const category = await CategorySch.findById(categoryId);
    if (!category)
      return res.status(404).json({ message: messages.category.notFound });

    const newItem = new foodItemSch(itemData);
    await newItem.save();

    // Add the new item's in category
    category.items.push(newItem._id);

    await category.save();

    res
      .status(201)
      .json({ message: messages.item.createSuccess, data: category });
  } catch (err) {
    res.status(500).json({ error: messages.item.createFail, err: err.message });
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
      message: messages.menu.getAllMenuSuccess,
      TotalData: menus.length,
      data: menus,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: messages.menu.FailedToGet, error: err.message });
  }
};


// GET a single menu by ID
export const getMenuById = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.menuId).populate({
      path: "categories",
      populate: { path: "items" },
    });

    if (!menu) return res.status(404).json({ message: messages.menu.notFound });

    res.status(200).json({ message: messages.menu.menuFetchById, data: menu });
  } catch (err) {
    res
      .status(500)
      .json({ error: messages.menu.menuFetchByIdFailed, err: err.message });
  }
};


// UPDATE a menu by ID
export const updateMenu = async (req, res) => {
  try {
    const menu = await Menu.findByIdAndUpdate(req.params.menuId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!menu) return res.status(404).json({ message: messages.menu.notFound });

    res.status(200).json({ message: messages.menu.updateSucess, data: menu });
  } catch (err) {
    res
      .status(500)
      .json({ error: messages.menu.updateFailed, err: err.message });
  }
};

// Update Category
export const updateCategory = async (req, res) => {
  const { menuId, categoryId } = req.params;
  const updates = req.body;

  try {
    const menu = await Menu.findById(menuId).populate("categories");
    if (!menu) return res.status(404).json({ message: messages.menu.notFound });

    // Find category by ID
    const category = menu.categories.find(
      (cat) => cat._id.toString() === categoryId
    );

    if (!category)
      return res.status(404).json({ message: messages.category.notFound });

    const newCategory = await CategorySch.findByIdAndUpdate(
      categoryId,
      updates,
      { new: true }
    );

    res
      .status(200)
      .json({ message: messages.category.updateSuccess, data: newCategory });
  } catch (err) {
    res
      .status(500)
      .json({ error: messages.category.updateFailed, err: err.message });
  }
};

// update ItemCtegory
export const updateItemInCategory = async (req, res) => {
  const { menuId, categoryId, itemId } = req.params;
  const updates = req.body;

  try {
    const menu = await Menu.findById(menuId);
    if (!menu) return res.status(404).json({ message: messages.menu.notFound });

    const hasCategory = menu.categories.some(
      (catId) => catId.toString() === categoryId
    );

    if (!hasCategory)
      return res.status(404).json({ message: messages.category.notInMenu });

    const category = await CategorySch.findById(categoryId);
    if (!category)
      return res.status(404).json({ message: messages.category.notFound });

    // Check if item exists in category.items
    const hasItem = category.items.some((item) => item.toString() === itemId);

    if (!hasItem)
      return res.status(404).json({ message: messages.item.notInCategory });

    const updatedItem = await foodItemSch.findByIdAndUpdate(itemId, updates, {
      new: true,
    });

    if (!updatedItem)
      return res.status(404).json({ message: messages.item.noFoundInDb });

    res.status(200).json({
      message: messages.item.updateSuccess,
      data: updatedItem,
    });
  } catch (err) {
    res.status(500).json({
      message: messages.item.updateItemFailed,
      err: err.message,
    });
  }
};

// DELETE menu
export const deleteMenu = async (req, res) => {
  try {
    const menu = await Menu.findByIdAndDelete(req.params.menuId);

    if (!menu) return res.status(404).json({ message: messages.menu.notFound });

    res.status(200).json({ message: messages.menu.deleteMenu, data: menu });
  } catch (err) {
    res
      .status(500)
      .json({ error: messages.menu.deleteFailed, error: err.messages });
  }
};

// DELETE Category
export const deleteCategory = async (req, res) => {
  const { menuId, categoryId } = req.params;

  try {
    const menu = await Menu.findById(menuId);
    if (!menu) {
      return res.status(404).json({ message: messages.menu.notFound });
    }

    // Remove the category reference from the menu
    menu.categories = menu.categories.filter(
      (id) => id.toString() !== categoryId
    );
    await menu.save();

    // Remove the actual Category
    await CategorySch.findByIdAndDelete(categoryId);

    res.status(200).json({
      message: messages.category.deleteSuccess,
      data: menu,
    });
  } catch (err) {
    res.status(500).json({
      message: messages.category.deleteFailed,
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
      return res.status(404).json({ message: messages.menu.notFound });
    }

    const categoryLinked = menu.categories.some(
      (catId) => catId.toString() === categoryId
    );

    if (!categoryLinked) {
      return res.status(400).json({ message: messages.category.notInMenu });
    }

    const category = await CategorySch.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: messages.category.notFound });
    }

    const itemLinked = category.items.some((id) => id.toString() === itemId);

    if (!itemLinked) {
      return res.status(404).json({ message: messages.item.notFound });
    }

    category.items.pull(itemId);

    await category.save();

    res.status(200).json({
      message: messages.item.deleteSuccess,
      data: category,
    });
  } catch (err) {
    res.status(500).json({
      message: messages.item.deleteFailed,
      error: err.message,
    });
  }
};
