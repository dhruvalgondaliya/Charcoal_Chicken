import restaurant from "../Models/Restaurant.js";

// Create Restaurant
export const createRestaurant = async (req, res) => {
  try {
    const existingResto = await restaurant.findOne({ email: req.body.email });

    if (existingResto) {
      return res.status(400).json({ message: "Restaurant already registered" });
    }

    const Resto = await restaurant.create(req.body);

    res.status(201).json({
      message: "Restaurant Created Successfully!",
      total: Resto.length,
      data: Resto,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to Create Restaurant",
      error: error.message,
    });
  }
};

// GetAll Restaurant
export const getAllRestaurunt = async (req, res) => {
  try {
    const getResto = await restaurant.find().populate("reviews");

    res.status(200).json({
      messaage: "All Restaurant Fetch SuccessFully!",
      TotalData: getResto.length,
      data: getResto,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed To Fetch Restaurant", error: err.message });
  }
};

//Restaurant GetById
export const RestoFindById = async (req, res) => {
  try {
    const getResto = await restaurant.findById(req.params.id);

    if (!getResto) {
      return res.status(404).json({ messaage: "Restaurant Not Found" });
    }

    res.status(200).json({
      messaage: "Restaurant Fetch By Id Successfully",
      data: getResto,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed To Fetch Restaurant By Id ",
      error: err.message,
    });
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
        messaage: "Restaurant Not Found",
      });
    }

    res.status(200).json({
      messaage: "Restaurant Update SuccessFully!",
      data: Resto,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed To Update Restaurant",
      error: err.message,
    });
  }
};

// Delete Restaurant
export const deleteRestaurant = async (req, res) => {
  try {
    const Resto = await restaurant.findByIdAndDelete(req.params.id);

    if (!Resto) {
      return res.status(404).json({
        messaage: "Restaurant Not Found",
      });
    }
    res.status(200).json({
      messaage: "Restaurant Delete SuccessFully!",
      data: Resto,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed To Delete Restaurant",
      error: err.message,
    });
  }
};
