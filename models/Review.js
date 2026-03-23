import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    recipe:   { type: mongoose.Schema.Types.Mixed, required: true }, 
    user:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true },
    avatar:   { type: String, default: "" },
    comment:     { type: String, required: true },
    recipeName:  { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Review", ReviewSchema);