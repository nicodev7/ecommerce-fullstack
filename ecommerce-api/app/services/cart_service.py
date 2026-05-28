from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from app.db.models import Cart, CartItem, Product
from uuid import UUID


class CartService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_create_cart(self, user_id: UUID) -> Cart:
        result = await self.db.execute(select(Cart).where(Cart.user_id == user_id))
        cart = result.scalar_one_or_none()
        if not cart:
            cart = Cart(user_id=user_id)
            self.db.add(cart)
            await self.db.commit()
            await self.db.refresh(cart)
        return cart

    async def get_cart(self, user_id: UUID) -> Cart:
        return await self.get_or_create_cart(user_id)

    async def add_item(self, user_id: UUID, product_id: UUID, quantity: int = 1) -> Cart:
        product_result = await self.db.execute(select(Product).where(Product.id == product_id))
        product = product_result.scalar_one_or_none()
        if not product or not product.is_active:
            raise HTTPException(status_code=404, detail="Product not found")

        cart = await self.get_or_create_cart(user_id)

        result = await self.db.execute(
            select(CartItem).where(CartItem.cart_id == cart.id, CartItem.product_id == product_id)
        )
        existing_item = result.scalar_one_or_none()

        if existing_item:
            existing_item.quantity += quantity
        else:
            item = CartItem(cart_id=cart.id, product_id=product_id, quantity=quantity)
            self.db.add(item)

        await self.db.commit()
        return cart

    async def update_item_quantity(self, user_id: UUID, item_id: UUID, quantity: int) -> Cart:
        cart = await self.get_or_create_cart(user_id)
        result = await self.db.execute(
            select(CartItem).where(CartItem.id == item_id, CartItem.cart_id == cart.id)
        )
        item = result.scalar_one_or_none()
        if not item:
            raise HTTPException(status_code=404, detail="Cart item not found")
        item.quantity = quantity
        await self.db.commit()
        return cart

    async def remove_item(self, user_id: UUID, item_id: UUID) -> Cart:
        cart = await self.get_or_create_cart(user_id)
        result = await self.db.execute(
            select(CartItem).where(CartItem.id == item_id, CartItem.cart_id == cart.id)
        )
        item = result.scalar_one_or_none()
        if not item:
            raise HTTPException(status_code=404, detail="Cart item not found")
        await self.db.delete(item)
        await self.db.commit()
        return cart

    async def clear_cart(self, user_id: UUID) -> None:
        cart = await self.get_or_create_cart(user_id)
        result = await self.db.execute(select(CartItem).where(CartItem.cart_id == cart.id))
        items = result.scalars().all()
        for item in items:
            await self.db.delete(item)
        await self.db.commit()
