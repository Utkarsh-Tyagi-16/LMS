import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { uploadMedia, deleteMediaFromCloudinary } from "../utils/cloudinary.js";

// Register Controller
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Log registration attempt
    console.log("Registration attempt:", { email, role });

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Validate role
    if (role && !["student", "instructor"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role selected.",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with default values
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword,
      role: role || "student", // Use provided role or default to student
      enrolledCourses: [], // Initialize empty enrolled courses array
      photoUrl: "" // Initialize empty photo URL
    });

    // Remove password from response
    const userWithoutPassword = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      enrolledCourses: user.enrolledCourses,
      photoUrl: user.photoUrl,
      createdAt: user.createdAt
    };

    // Log successful registration
    console.log("User registered successfully:", user.email);

    // Generate token and send response
    return generateToken(res, userWithoutPassword, "Account created successfully.");

  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to register. Please try again.",
    });
  }
};

// Login Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Log the incoming request data
    console.log("Login attempt:", { email });

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password.",
      });
    }

    // Remove password from user object
    const userWithoutPassword = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      photoUrl: user.photoUrl,
      enrolledCourses: user.enrolledCourses,
      createdAt: user.createdAt
    };

    // Log successful login
    console.log("Login successful for user:", user.email);

    return generateToken(res, userWithoutPassword, `Welcome back ${user.name}`);

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to login. Please try again.",
    });
  }
};

// Logout Controller
export const logout = async (_, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to logout.",
    });
  }
};

// Get Profile Controller
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.id;

    const user = await User.findById(userId)
      .select("-password")
      .populate({
        path: "enrolledCourses",
        populate: {
          path: "creator",
          select: "name photoUrl"
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to load user.",
    });
  }
};

// Update Profile Controller
export const updateProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { name } = req.body;
    const profilePhoto = req.file;

    console.log("Update profile request:", { 
      userId, 
      name, 
      hasFile: !!profilePhoto,
      fileDetails: profilePhoto ? {
        filename: profilePhoto.filename,
        mimetype: profilePhoto.mimetype,
        size: profilePhoto.size,
        path: profilePhoto.path
      } : null
    });

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User ID missing"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    let photoUrl = user.photoUrl;

    if (profilePhoto) {
      try {
        // Upload new photo
        console.log("Uploading new photo to Cloudinary:", profilePhoto.path);
        const cloudResponse = await uploadMedia(profilePhoto.path);
        console.log("Cloudinary upload response:", cloudResponse);

        if (!cloudResponse || !cloudResponse.secure_url) {
          throw new Error("Failed to get secure URL from Cloudinary");
        }
        photoUrl = cloudResponse.secure_url;
      } catch (error) {
        console.error("Error handling profile photo:", error);
        return res.status(500).json({
          success: false,
          message: error.message || "Failed to process profile photo. Please try again.",
          error: error.message
        });
      }
    }

    // Only update fields that are provided
    const updatedData = {};
    if (name) updatedData.name = name;
    if (photoUrl) updatedData.photoUrl = photoUrl;

    // If no updates provided
    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No updates provided.",
      });
    }

    console.log("Updating user with data:", updatedData);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updatedData,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!updatedUser) {
      return res.status(500).json({
        success: false,
        message: "Failed to update user profile.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
      error: error.message
    });
  }
};
