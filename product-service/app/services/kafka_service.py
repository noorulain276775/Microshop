import os
from aiokafka import AIOKafkaProducer
import asyncio
import json

# Kafka configuration
KAFKA_BROKERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092")
TOPIC = os.getenv("KAFKA_TOPIC", "product-created")

# Global producer variable
producer: AIOKafkaProducer = None

async def init_kafka_producer(retries: int = 10, delay: int = 5):
    """
    Initialize Kafka producer with retries.
    """
    global producer
    for i in range(retries):
        try:
            producer = AIOKafkaProducer(
                bootstrap_servers=KAFKA_BROKERS
            )
            await producer.start()
            print("Kafka producer started")
            return
        except Exception as e:
            print(f"Kafka not ready yet ({i+1}/{retries}): {e}")
            await asyncio.sleep(delay)
    raise RuntimeError("Kafka not available after retries")

async def send_product_event(product_data: dict):
    """
    Send a product event to Kafka.
    """
    if producer is None:
        raise RuntimeError("Kafka producer is not initialized")
    try:
        await producer.send_and_wait(TOPIC, json.dumps(product_data).encode("utf-8"))
        print(f"Sent product event to topic '{TOPIC}': {product_data['name']}")
    except Exception as e:
        print(f"Failed to send product event: {e}")

async def close_producer():
    """
    Properly close Kafka producer.
    """
    global producer
    if producer:
        await producer.stop()
        print("Kafka producer stopped")
        producer = None
