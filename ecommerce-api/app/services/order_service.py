from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from app.db.models import Order, OrderStatus, Cart, CartItem, Product
from uuid import UUID


class OrderService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_orders(self, user_id: UUID) -> list[Order]:
        result = await self.db.execute(
            select(Order).where(Order.user_id == user_id).order_by(Order.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_order(self, user_id: UUID, order_id: UUID) -> Order:
        result = await self.db.execute(
            select(Order).where(Order.id == order_id, Order.user_id == user_id)
        )
        order = result.scalar_one_or_none()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return order

    async def create_order_from_cart(self, user_id: UUID) -> Order:
        cart_result = await self.db.execute(select(Cart).where(Cart.user_id == user_id))
        cart = cart_result.scalar_one_or_none()
        if not cart:
            raise HTTPException(status_code=400, detail="Cart is empty")

        items_result = await self.db.execute(
            select(CartItem).where(CartItem.cart_id == cart.id)
        )
        cart_items = items_result.scalars().all()
        if not cart_items:
            raise HTTPException(status_code=400, detail="Cart is empty")

        order_items = []
        total = 0.0
        for cart_item in cart_items:
            product_result = await self.db.execute(select(Product).where(Product.id == cart_item.product_id))
            product = product_result.scalar_one_or_none()
            if not product:
                continue
            order_items.append({
                "product_id": str(product.id),
                "name": product.name,
                "price": product.price,
                "quantity": cart_item.quantity,
            })
            total += product.price * cart_item.quantity

        order = Order(
            user_id=user_id,
            items=order_items,
            total=round(total, 2),
            status=OrderStatus.pending,
        )
        self.db.add(order)

        for cart_item in cart_items:
            await self.db.delete(cart_item)
        await self.db.commit()
        await self.db.refresh(order)
        return order

    async def update_order_status(self, order_id: UUID, status: str) -> Order:
        result = await self.db.execute(select(Order).where(Order.id == order_id))
        order = result.scalar_one_or_none()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        order.status = OrderStatus(status)
        await self.db.commit()
        await self.db.refresh(order)
        return order

    async def get_order_by_id(self, order_id: UUID) -> Order:
        result = await self.db.execute(select(Order).where(Order.id == order_id))
        order = result.scalar_one_or_none()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return order
