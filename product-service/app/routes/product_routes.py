from fastapi import APIRouter, HTTPException
from app.models.product_model import Product
from app.services import kafka_service
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os

router = APIRouter()
mongo_uri = os.getenv("MONGO_URI")
client = AsyncIOMotorClient(mongo_uri)
db = client["product-service"]
collection = db["products"]

@router.post("/products")
async def create_product(product: Product):
    product_dict = product.dict()
    result = await collection.insert_one(product_dict)
    product_dict["_id"] = str(result.inserted_id)
    
    # Send Kafka event
    await kafka_service.send_product_event(product_dict)
    
    return {"status": "success", "product": product_dict}

@router.get("/products")
async def get_products():
    products_cursor = collection.find()
    products = await products_cursor.to_list(length=100)
    for p in products:
        p["_id"] = str(p["_id"])
    return products

# Get single product by ID
@router.get("/product/{product_id}")
async def get_product(product_id: str):
    try:
        obj_id = ObjectId(product_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid product ID")
    
    product = await collection.find_one({"_id": obj_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product["_id"] = str(product["_id"])
    return product