import UserProSch from "../Models/UserProfiles.js";

// Create
export const CreateProfile = async (req, res) => {
  const { restaurantId } = req.params;

  try {
    const { file, body } = req;
    const { email } = body;
    const imageUrl = file ? `/uploads/${file.filename}` : null;

    // Check if user Existing
    const existingUser = await UserProSch.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User Already Exists",
      });
    }

    const user = new UserProSch({
      ...body,
      restaurantId,
      imageUrl,
    });

    await user.save();

    res.status(201).json({
      message: "User Profile Created Successfully",
      data: user,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Fetch Profiles
export const getUserProfiles = async (req, res) => {
  const { restaurantId } = req.params;

  try {
    const getprofile = await UserProSch.findOne({ restaurantId });

    if (!getprofile) {
      return res.status(404).json({
        message: "User Profile Not Found",
      });
    }

    res.status(200).json({
      message: "User Profile Fetched Successfully",
      data: getprofile,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Edit Profile
export const updateUserProfile = async (req, res) => {
  const { profileId } = req.params;
  try {
    const { file, body } = req;
    const imageUrl = file ? `/uploads/${file.filename}` : null;

    const updateData = {
      ...body,
    };

    if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }

    const updatedProfile = await UserProSch.findByIdAndUpdate(
      profileId,
      updateData,
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "User Profile Not Found" });
    }

    res.status(200).json({
      message: "User Profile Updated Successfully",
      data: updatedProfile,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
