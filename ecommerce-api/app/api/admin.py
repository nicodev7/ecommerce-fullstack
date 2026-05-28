from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Annotated
from app.db.session import get_db
from app.core.deps import get_current_user
from app.db.models import User, UserRole, Order, Payment, Product

router = APIRouter()

async def require_admin(current_user: Annotated[User, Depends(get_current_user)]):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@router.get("/stats")
async def get_stats(
    admin: Annotated[User, Depends(require_admin)],
    db: AsyncSession = Depends(get_db),
):
    order_count_result = await db.execute(select(func.count(Order.id)))
    order_count = order_count_result.scalar()

    total_revenue_result = await db.execute(select(func.sum(Order.total)))
    total_revenue = total_revenue_result.scalar() or 0.0

    user_count_result = await db.execute(select(func.count(User.id)))
    user_count = user_count_result.scalar()

    product_count_result = await db.execute(select(func.count(Product.id)))
    product_count = product_count_result.scalar()

    return {
        "orders": order_count,
        "total_revenue": round(float(total_revenue), 2),
        "users": user_count,
        "products": product_count,
    }

@router.get("/users")
async def list_users(
    admin: Annotated[User, Depends(require_admin)],
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User))
    users = result.scalars().all()
    return [
        {"id": str(u.id), "email": u.email, "role": u.role.value, "created_at": str(u.created_at)}
        for u in users
    ]

@router.get("/orders")
async def list_all_orders(
    admin: Annotated[User, Depends(require_admin)],
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Order))
    orders = result.scalars().all()
    return [
        {
            "id": str(o.id),
            "user_id": str(o.user_id),
            "total": o.total,
            "status": o.status.value,
            "created_at": str(o.created_at),
        }
        for o in orders
    ]
