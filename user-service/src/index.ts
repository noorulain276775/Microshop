import express from "express";
import { connectProducer, producer } from "./kafka";

const app = express();
app.use(express.json());

// Register route
app.post("/register", async (req, res) => {
  const { username, email } = req.body;

  // Produce Kafka event
  await producer.send({
    topic: "user-registered",
    messages: [
      { value: JSON.stringify({ username, email, date: new Date() }) },
    ],
  });

  console.log("Sent event: USER_REGISTERED");
  res.json({ status: "User registered & event sent" });
});

// Start server
const start = async () => {
  await connectProducer();
  app.listen(4000, () => console.log("User-service running on port 4000"));
};

start();
