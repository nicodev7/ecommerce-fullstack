from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class InitiatePayment(BaseModel):
    order_id: UUID
    method: str = "card"


class PaymentResponse(BaseModel):
    id: UUID
    order_id: UUID
    amount: float
    method: str
    status: str
    transaction_id: str
    created_at: datetime

    model_config = {"from_attributes": True}
