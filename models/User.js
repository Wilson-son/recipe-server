import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username:  { type: String, required: true, unique: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:  { type: String, required: true },
    avatar:    { type: String, default: "" },
    avatarPublicId:  { type: String, default: null },
    bio:       { type: String, default: "" },

    savedRecipes: [{ type: mongoose.Schema.Types.Mixed }],

    isVerified:              { type: Boolean, default: false },
    verificationToken:       { type: String, index: true },
    verificationTokenExpiry: { type: Date },

    resetToken:              { type: String, index: true },
    resetTokenExpiry:        { type: Date },

    tokenVersion: { type: Number, default: 0 }, 
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);