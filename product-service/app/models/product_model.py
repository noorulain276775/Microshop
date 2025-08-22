from pydantic import BaseModel, Field
from typing import Optional

class Product(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock: int
