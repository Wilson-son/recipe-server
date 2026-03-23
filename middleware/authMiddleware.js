import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔑 Decoded token:", decoded); // ← add this

    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ msg: "User not found" });

    console.log("👤 User tokenVersion:", user.tokenVersion); // ← add this
    console.log("🔑 Token tokenVersion:", decoded.tokenVersion); // ← add this

    if (user.tokenVersion !== decoded.tokenVersion) {
      console.log("❌ Token version mismatch!"); // ← add this
      return res.status(401).json({ msg: "Session expired. Please login again." });
    }

    req.user = { _id: decoded.id };
    next();
  } catch (err) {
    console.error("❌ Auth error:", err.message); // ← add this
    res.status(401).json({ msg: "Invalid token" });
  }
}