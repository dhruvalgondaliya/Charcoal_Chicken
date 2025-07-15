const messages = {
  menu: {
    notFound: "Menu not found",
    fetchSuccess: "Menu fetched successfully",
    createSuccess: "Menu created successfully",
    createFail: "Failed to create menu",
    getAllMenuSuccess: "Fetched all menus successfully",
    FailedToGet: "Failed to fetch all menus",
    menuFetchById: "Menu fetched by ID successfully",
    updateSucess: "Menu updated successfully",
    updateFailed: "Failed to update menu",
    menuFetchFailedId: "Failed to get menu by ID",
    deleteMenu: "Menu deleted successfully",
    deleteFailed: "Failed to delete menu",
    menuFetchByIdFailed: "Failed to fetch menu by ID",
  },

  category: {
    notFound: "Category not found",
    notInMenu: "Category does not belong to the menu",
    createSuccess: "Category created successfully",
    createFail: "Failed to create category",
    itemAddSuccess: "Item added to category successfully",
    itemAddFail: "Failed to add item to category",
    updateSuccess: "Category updated successfully",
    updateFailed: "Failed to update category",
    deleteSuccess: "Category deleted successfully",
    deleteFailed: "Failed to delete category",
  },

  item: {
    createSuccess: "Item created successfully",
    createFail: "Failed to create item",
    notFound: "Item not found",
    updateItem: "Item updated successfully",
    updateItemFailed: "Failed to update item",
    deleteSuccess: "Item deleted successfully",
    deleteFailed: "Failed to delete item",
    notInCategory: "Item not found in this category",
    noFoundInDb: "Item not found in database",
  },
};

export default messages;
