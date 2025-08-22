import express from "express";
import { connectDB } from "./config/db";
import { connectProducer } from "./kafka";
import userRoutes from "./routes/userRoutes";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

// Health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// Routes
app.use("/", userRoutes);

const start = async () => {
  await connectDB();
  await connectProducer();
  app.listen(4000, () => console.log("User-service running on http://localhost:4000"));
};

start();
