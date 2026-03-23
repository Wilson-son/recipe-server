import dotenv from "dotenv";
dotenv.config(); // ← load env first

import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("☁️ Cloudinary config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY ? "✅" : "❌ MISSING",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "✅" : "❌ MISSING",
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "RecipeApp",
    allowed_formats: ["jpg", "jpeg", "png", "webp","avif"],
    format: "jpg",
    transformation: [{ width: 800, quality: "auto" }],
  },
});

export const upload = multer({ storage });
export default cloudinary;
