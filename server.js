
import dotenv from "dotenv";
dotenv.config();


import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import fs from "fs";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/userRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";


const app = express();

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
  console.log("Created uploads/ folder");
}

app.use(cors({
  origin: function(origin, callback) {
   
    if (!origin || origin.startsWith("http://localhost")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));



app.use(express.json());

app.use("/api/auth", authRoutes);      
app.use("/api/users", userRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/reviews", reviewRoutes);


app.get("/", (req, res) => res.send("API is running..."));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));