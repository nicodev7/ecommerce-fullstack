from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class AddCartItem(BaseModel):
    product_id: UUID
    quantity: int = 1


class UpdateCartItem(BaseModel):
    quantity: int


class CartItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    quantity: int

    model_config = {"from_attributes": True}


class CartResponse(BaseModel):
    id: UUID
    user_id: UUID
    items: list[CartItemResponse] = []
    created_at: datetime

    model_config = {"from_attributes": True}
