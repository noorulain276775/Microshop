from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.routes import product_routes
from app.services import kafka_service
from motor.motor_asyncio import AsyncIOMotorClient
import os

# MongoDB setup
mongo_uri = os.getenv("MONGO_URI", "mongodb://mongo:27017/product-service")
client = AsyncIOMotorClient(mongo_uri)
db = client["product-service"]
collection = db["products"]

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        # Connect to MongoDB
        print("Connecting to MongoDB...")
        await client.admin.command("ping")
        print("MongoDB connected")

        # Initialize Kafka producer
        print("Initializing Kafka producer...")
        await kafka_service.init_kafka_producer()
        print("Kafka Producer started")

        yield

    finally:
        print("Shutting down services...")
        await kafka_service.close_producer()
        client.close()
        print("Services stopped")

# Create FastAPI app
app = FastAPI(title="Product Service", lifespan=lifespan)

# Include routers
app.include_router(product_routes.router)

@app.get("/")
async def root():
    return {"message": "Product Service is up and running!"}
