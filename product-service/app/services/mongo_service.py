# app/services/mongo_service.py
from motor.motor_asyncio import AsyncIOMotorClient
import os

client = None
db = None

async def connect():
    global client, db
    mongo_uri = os.getenv("MONGO_URI")
    client = AsyncIOMotorClient(mongo_uri)
    db = client.get_default_database()
    print("MongoDB connected")

async def disconnect():
    global client
    if client:
        client.close()
        print("MongoDB disconnected")
