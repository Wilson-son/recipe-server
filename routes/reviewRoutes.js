import express from "express";
import Review from "../models/Review.js";
import Recipe from "../models/Recipe.js";
import User from "../models/User.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();


router.get("/user/mine", auth, async (req, res) => {
  try {
   
    const myReviews = await Review.find({ user: req.user._id }).sort({ createdAt: -1 });

    const myRecipes = await Recipe.find({ user: req.user._id }, "_id title");
    const myRecipeIds = myRecipes.map((r) => r._id.toString());

    
    const reviewsOnMyRecipes = await Review.find({
      recipe: { $in: myRecipeIds },
      user: { $ne: req.user._id },
    }).sort({ createdAt: -1 });

   
    const enriched = reviewsOnMyRecipes.map((review) => {
      const match = myRecipes.find((r) => r._id.toString() === review.recipe.toString());
      return { ...review.toObject(), recipeName: match?.title || review.recipeName || "" };
    });

    res.json({ myReviews, reviewsOnMyRecipes: enriched });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/:recipeId", async (req, res) => {
  try {
    const reviews = await Review.find({ recipe: req.params.recipeId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/:recipeId", auth, async (req, res) => {
  try {
    const { comment, recipeName } = req.body;
    if (!comment?.trim()) return res.status(400).json({ message: "Comment is required" });

    const existing = await Review.findOne({ recipe: req.params.recipeId, user: req.user._id });
    if (existing) return res.status(400).json({ message: "You already reviewed this recipe" });

    const user = await User.findById(req.user._id);
    const review = await Review.create({
      recipe:     req.params.recipeId,
      user:       req.user._id,
      username:   user.username,
      avatar:     user.avatar,
      comment:    comment.trim(),
      recipeName: recipeName || "",
    });
    res.status(201).json(review);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});


router.put("/:reviewId", auth, async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment?.trim()) return res.status(400).json({ message: "Comment is required" });

    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    review.comment = comment.trim();
    await review.save();
    res.json(review);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});


router.delete("/:reviewId", auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    await review.deleteOne();
    res.json({ message: "Review deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;