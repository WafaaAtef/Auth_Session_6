import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import {router} from "./routes/userRoutes";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cookieParser());
app.use(express.json());
app.use("/auth",router);

mongoose.connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log('Connected to MongoDB Atlas!');
    app.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
    });
  })

  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });