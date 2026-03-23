import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  category:    { type: String, required: true },
  prepTime:    { type: String, required: true },
  servings:    { type: Number, required: true },
  difficulty:  { type: String, required: true },
  ingredients:  [{ type: String, required: true }],
  instructions: [{ type: String, required: true }],
  image:        [{ type: String, required: true }],
  imagePublicId: { type: String, default: null },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  
  author: {
    type: String,
    default: "",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Recipe = mongoose.model("Recipe", recipeSchema);
export default Recipe;