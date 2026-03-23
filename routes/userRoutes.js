import express from "express";
import User from "../models/User.js";
import auth from "../middleware/authMiddleware.js";
import { upload } from "../utils/cloudinary.js"; 
import cloudinary from "../utils/cloudinary.js"; 

const router = express.Router();


router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      name:         user.username,
      email:        user.email,
      avatar:       user.avatar,
      bio:          user.bio,
      savedRecipes: user.savedRecipes,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


router.put("/profile", auth, async (req, res) => {
  try {
    const { name, bio } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(name             && { username: name }),
        ...(bio !== undefined && { bio }),
      },
      { new: true }
    );
    res.json({
      name:   user.username,
      email:  user.email,
      avatar: user.avatar,
      bio:    user.bio,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/avatar", auth, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const existing = await User.findById(req.user._id);

   
    if (existing.avatarPublicId) {
      await cloudinary.uploader.destroy(existing.avatarPublicId);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        avatar:        req.file.path,     
        avatarPublicId: req.file.filename, 
      },
      { new: true }
    );

    res.json({
      message: "Avatar updated",
      name:    user.username,
      avatar:  user.avatar,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/save/:recipeId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const recipeId = req.params.recipeId;

    const alreadySaved = user.savedRecipes.some(
      (id) => id.toString() === recipeId
    );

    if (alreadySaved) {
      user.savedRecipes = user.savedRecipes.filter(
        (id) => id.toString() !== recipeId
      );
    } else {
      user.savedRecipes.push(recipeId);
    }

    await user.save();
    res.json({ saved: !alreadySaved, savedRecipes: user.savedRecipes });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/saved", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.savedRecipes);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;