from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Any


class ProductCreate(BaseModel):
    name: str
    description: str = ""
    price: float
    stock: int = 0
    category: str = ""
    images: list[Any] = []


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: float | None = None
    stock: int | None = None
    category: str | None = None
    images: list[Any] | None = None
    is_active: bool | None = None


class ProductResponse(BaseModel):
    id: UUID
    name: str
    description: str
    price: float
    stock: int
    category: str
    images: list[Any]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
