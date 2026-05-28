from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated
from app.db.session import get_db
from app.core.deps import get_current_user
from app.db.models import User, UserRole
from app.services.order_service import OrderService
from app.models.order import OrderResponse, OrderStatusUpdate

router = APIRouter()

@router.get("/", response_model=list[OrderResponse])
async def list_orders(
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
):
    service = OrderService(db)
    return await service.list_orders(current_user.id)

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
):
    service = OrderService(db)
    return await service.get_order(current_user.id, order_id)

@router.post("/", response_model=OrderResponse)
async def create_order(
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
):
    service = OrderService(db)
    return await service.create_order_from_cart(current_user.id)

@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: str,
    req: OrderStatusUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    service = OrderService(db)
    return await service.update_order_status(order_id, req.status)
