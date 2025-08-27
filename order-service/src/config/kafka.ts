import { Producer, KafkaClient } from 'kafka-node';
import dotenv from 'dotenv';

dotenv.config();

// Kafka configuration
const KAFKA_BROKERS = process.env.KAFKA_BROKERS || 'localhost:9092';
const KAFKA_TOPIC = process.env.KAFKA_TOPIC || 'order-created';

// Create Kafka client
const kafka = new KafkaClient({
  clientId: 'order-service',
  kafkaHost: KAFKA_BROKERS
});

// Create producer
const producer = new Producer(kafka);

// Producer ready event
producer.on('ready', () => {
  console.log('Kafka producer is ready');
});

// Producer error event
producer.on('error', (error) => {
  console.error('Kafka producer error:', error);
});

// Producer close event
producer.on('close' as any, () => {
  console.log('Kafka producer closed');
});

// Publish order event to Kafka
export const publishOrderEvent = async (orderData: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    const message = JSON.stringify(orderData);
    
    producer.send([
      {
        topic: KAFKA_TOPIC,
        messages: [message],
        partition: 0
      }
    ], (error, result) => {
      if (error) {
        console.error('Failed to publish order event to Kafka:', error);
        reject(error);
      } else {
        console.log('Order event published to Kafka successfully:', {
          topic: KAFKA_TOPIC,
          orderId: orderData.orderId,
          userId: orderData.userId
        });
        resolve();
      }
    });
  });
};

// Close producer connection
export const closeProducer = (): void => {
  producer.close();
};

export default producer;
