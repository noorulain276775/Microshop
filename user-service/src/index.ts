import express from "express";
import { connectDB } from "./config/db";
import { connectProducer, producer } from "./kafka";
import { User } from "./models/User";

const app = express();
app.use(express.json());

// Health
app.get("/health", (_req, res) => res.json({ ok: true }));

// Register
app.post("/register", async (req, res) => {
  try {
    const { username, email } = req.body;
    if (!username || !email) return res.status(400).json({ error: "username and email are required" });

    // Save to Mongo
    const user = await User.create({ username, email });

    // Publish Kafka event
    await producer.send({
      topic: "user-registered",
      messages: [{ value: JSON.stringify({ id: user._id, username, email, createdAt: user.createdAt }) }],
    });

    console.log("📨 Sent event: user-registered");
    res.status(201).json({ status: "User created", userId: user._id });
  } catch (err: any) {
    if (err.code === 11000) return res.status(409).json({ error: "email already exists" });
    console.error(err);
    res.status(500).json({ error: "internal error" });
  }
});


/**
 * Start the application by connecting to the database and the Kafka producer.
 * Then start the Express server on port 4000.
 */
const start = async () => {
  await connectDB();
  await connectProducer();
  app.listen(4000, () => {
    console.log("User-service running on http://localhost:4000");
  });
};

start();
