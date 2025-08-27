import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

export const connectDB = async () => {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI environment variable is required');
  }
  
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected:", MONGO_URI);
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};
