import express from "express";
import { User } from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { producer } from "../kafka";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET!;

// -------- REGISTER --------
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: "username, email, and password are required" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });

    // Kafka event only if producer exists
    if (producer) {
      try {
        await producer.send({
          topic: "user-registered",
          messages: [{ value: JSON.stringify({ id: user._id, username, email, createdAt: user.createdAt }) }],
        });
        console.log("📨 Sent event: user-registered");
      } catch (err) {
        console.error("⚠️ Failed to send Kafka event:", err);
      }
    }

    res.status(201).json({ status: "User created", userId: user._id });
  } catch (err: any) {
    if (err.code === 11000) return res.status(409).json({ error: "email already exists" });
    console.error(err);
    res.status(500).json({ error: "internal error" });
  }
});

// -------- LOGIN --------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email and password are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, email: user.email, username: user.username }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal error" });
  }
});

export default router;
