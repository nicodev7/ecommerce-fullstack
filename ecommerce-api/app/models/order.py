from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Any


class CreateOrder(BaseModel):
    pass


class OrderResponse(BaseModel):
    id: UUID
    user_id: UUID
    items: list[Any]
    total: float
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: str
