import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from app.db.models import Payment, PaymentStatus, Order, OrderStatus
from uuid import UUID, uuid4


class PaymentService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def initiate_payment(self, order_id: UUID, method: str = "card") -> Payment:
        order_result = await self.db.execute(select(Order).where(Order.id == order_id))
        order = order_result.scalar_one_or_none()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        payment = Payment(
            order_id=order_id,
            amount=order.total,
            method=method,
            status=PaymentStatus.pending,
            transaction_id=str(uuid4()),
        )
        self.db.add(payment)
        await self.db.commit()
        await self.db.refresh(payment)
        return payment

    async def get_payment(self, payment_id: UUID) -> Payment:
        result = await self.db.execute(select(Payment).where(Payment.id == payment_id))
        payment = result.scalar_one_or_none()
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        return payment

    async def simulate_payment(self, payment_id: UUID) -> Payment:
        result = await self.db.execute(select(Payment).where(Payment.id == payment_id))
        payment = result.scalar_one_or_none()
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")

        payment.status = PaymentStatus.processing
        await self.db.commit()

        await asyncio.sleep(2)

        payment.status = PaymentStatus.succeeded
        await self.db.commit()
        await self.db.refresh(payment)

        order_result = await self.db.execute(select(Order).where(Order.id == payment.order_id))
        order = order_result.scalar_one_or_none()
        if order:
            order.status = OrderStatus.paid
            await self.db.commit()

        return payment
