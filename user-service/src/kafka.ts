import { Kafka, Producer } from "kafkajs";
import dotenv from "dotenv";
dotenv.config();

export let producer: Producer;

const ENABLE_KAFKA = process.env.ENABLE_KAFKA === "true";

export const connectProducer = async () => {
  if (!ENABLE_KAFKA) return console.log("Kafka disabled");

  try {
    const kafka = new Kafka({
      clientId: "user-service",
      brokers: [process.env.KAFKA_BROKERS!],
    });

    producer = kafka.producer();
    await producer.connect();
    console.log("✅ Kafka producer connected");
  } catch (err) {
    console.error("❌ Kafka connection failed:", err);
    process.exit(1); // crash app if Kafka is required
  }
};

