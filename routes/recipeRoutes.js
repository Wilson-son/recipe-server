import express from "express";
import Recipe from "../models/Recipe.js";
import User from "../models/User.js";
import protect from "../middleware/authMiddleware.js";
import { upload } from "../utils/cloudinary.js";
import cloudinary from "../utils/cloudinary.js";  

const router = express.Router();


router.get("/", async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch recipes" });
  }
});


router.get("/my", protect, async (req, res) => {
  try {
    const recipes = await Recipe.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch recipes" });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch recipe" });
  }
});


router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    const {
      title, description, category,
      prepTime, servings, difficulty,
      ingredients, instructions,
    } = req.body;

    const user = await User.findById(req.user._id);

    const recipe = new Recipe({
      title,
      description,
      category,
      prepTime,
      servings,
      difficulty,
      ingredients:  typeof ingredients  === "string" ? JSON.parse(ingredients)  : ingredients,
      instructions: typeof instructions === "string" ? JSON.parse(instructions) : instructions,
      
      image: req.file ? [req.file.path] : [],
   
      imagePublicId: req.file ? req.file.filename : null,
      user: req.user._id,
      author: user.username,
    });

    const savedRecipe = await recipe.save();
    res.status(201).json(savedRecipe);
  } catch (error) {
    console.error("Create error:", error.message);
    res.status(500).json({ message: error.message });
  }
});


router.put("/:id", protect, upload.single("image"), async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    if (recipe.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const {
      title, description, category,
      prepTime, servings, difficulty,
      ingredients, instructions,
      existingImage,
    } = req.body;

    let imageArray = [];
    let imagePublicId = recipe.imagePublicId;

    if (req.file) {
     
      if (recipe.imagePublicId) {
        await cloudinary.uploader.destroy(recipe.imagePublicId);
      }
      imageArray = [req.file.path]; 
      imagePublicId = req.file.filename;
    } else if (existingImage) {
      imageArray = [existingImage];
    }

    const updated = await Recipe.findByIdAndUpdate(
      req.params.id,
      {
        title, description, category,
        prepTime, servings, difficulty,
        ingredients:  typeof ingredients  === "string" ? JSON.parse(ingredients)  : ingredients,
        instructions: typeof instructions === "string" ? JSON.parse(instructions) : instructions,
        image: imageArray,
        imagePublicId,
      },
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    console.error("Update error:", error.message);
    res.status(500).json({ message: error.message });
  }
});


router.delete("/:id", protect, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    if (recipe.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

 
    if (recipe.imagePublicId) {
      await cloudinary.uploader.destroy(recipe.imagePublicId);
    }

    await recipe.deleteOne();
    res.json({ message: "Recipe deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;