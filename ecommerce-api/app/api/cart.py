from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated
from app.db.session import get_db
from app.core.deps import get_current_user
from app.db.models import User
from app.services.cart_service import CartService
from app.models.cart import AddCartItem, UpdateCartItem, CartResponse, CartItemResponse

router = APIRouter()

@router.get("/", response_model=CartResponse)
async def get_cart(
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
):
    service = CartService(db)
    return await service.get_cart(current_user.id)

@router.post("/items")
async def add_item(
    req: AddCartItem,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
):
    service = CartService(db)
    await service.add_item(current_user.id, req.product_id, req.quantity)
    return {"message": "Item added to cart"}

@router.put("/items/{item_id}")
async def update_item(
    item_id: str,
    req: UpdateCartItem,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
):
    service = CartService(db)
    await service.update_item_quantity(current_user.id, item_id, req.quantity)
    return {"message": "Cart item updated"}

@router.delete("/items/{item_id}")
async def remove_item(
    item_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
):
    service = CartService(db)
    await service.remove_item(current_user.id, item_id)
    return {"message": "Cart item removed"}

@router.delete("/")
async def clear_cart(
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
):
    service = CartService(db)
    await service.clear_cart(current_user.id)
    return {"message": "Cart cleared"}
