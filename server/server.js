import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDb from "./src/config/connectDb.js";
import { router as userRoutes } from "./src/routes/userRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
  
// Database Connection
connectDb();

// API Routes
app.use("/api/v1/user", userRoutes);

// Server on PORT
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port: ${process.env.PORT}`);
});
