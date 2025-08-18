import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: 'user-service',
  brokers: ['localhost:29092']
});

export const producer = kafka.producer();

export const connectProducer = async () => {
    await producer.connect();
    console.log("Kafka producer connected")
}