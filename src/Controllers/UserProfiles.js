import UserProSch from "../Models/UserProfiles.js";

// Create
export const CreateProfile = async (req, res) => {
  const { restaurantId } = req.params;
  const file = req.file;
  const body = req.body;

  try {
    if (!file) {
      return res.status(400).json({ error: "Image is required" });
    }

    const existingUser = await UserProSch.findOne({ email: body.email });
    if (existingUser) {
      return res.status(400).json({ message: "User Already Exists" });
    }

    const imageurl = `/uploads/${file.filename}`;

    const user = new UserProSch({
      ...body,
      restaurantId,
      imageurl,
    });

    console.log("testing data:", body);
    console.log("file:", file);

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

    const existingProfile = await UserProSch.findById(profileId);
    if (!existingProfile) {
      return res.status(404).json({ message: "User Profile Not Found" });
    }

    // Only replace image if a new file is uploaded
    const imageurl = file
      ? `/uploads/${file.filename}`
      : existingProfile.imageurl;

    const updateData = {
      ...body,
      imageurl,
    };

    console.log("testing for image url:", imageurl);

    const updatedProfile = await UserProSch.findByIdAndUpdate(
      profileId,
      updateData,
      { new: true }
    );

    res.status(200).json({
      message: "User Profile Updated Successfully",
      data: updatedProfile,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

