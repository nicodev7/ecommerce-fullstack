from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated
from app.db.session import get_db
from app.core.deps import get_current_user
from app.db.models import User
from app.services.payment_service import PaymentService
from app.models.payment import InitiatePayment, PaymentResponse

router = APIRouter()

@router.post("/", response_model=PaymentResponse)
async def initiate_payment(
    req: InitiatePayment,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
):
    service = PaymentService(db)
    return await service.initiate_payment(req.order_id, req.method)

@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
):
    service = PaymentService(db)
    return await service.get_payment(payment_id)

@router.post("/{payment_id}/simulate", response_model=PaymentResponse)
async def simulate_payment(
    payment_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
):
    service = PaymentService(db)
    return await service.simulate_payment(payment_id)
