import pytest
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4
from fastapi import HTTPException
from app.services.order_service import OrderService
from app.db.models import OrderStatus


@pytest.fixture
def mock_db():
    db = AsyncMock()
    db.execute = AsyncMock()
    db.add = MagicMock()
    db.delete = AsyncMock()
    db.commit = AsyncMock()
    db.refresh = AsyncMock()
    return db


@pytest.mark.asyncio
async def test_list_orders(mock_db):
    order = MagicMock()
    order.id = uuid4()
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [order]
    mock_db.execute.return_value = mock_result

    service = OrderService(mock_db)
    orders = await service.list_orders(uuid4())

    assert len(orders) == 1
    assert orders[0].id == order.id


@pytest.mark.asyncio
async def test_get_order_found(mock_db):
    order = MagicMock()
    order.id = uuid4()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = order
    mock_db.execute.return_value = mock_result

    service = OrderService(mock_db)
    result = await service.get_order(uuid4(), order.id)

    assert result.id == order.id


@pytest.mark.asyncio
async def test_get_order_not_found(mock_db):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result

    service = OrderService(mock_db)
    with pytest.raises(HTTPException) as exc:
        await service.get_order(uuid4(), uuid4())

    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_create_order_from_cart_empty(mock_db):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result

    service = OrderService(mock_db)
    with pytest.raises(HTTPException) as exc:
        await service.create_order_from_cart(uuid4())

    assert exc.value.status_code == 400
    assert "empty" in exc.value.detail.lower()


@pytest.mark.asyncio
async def test_update_order_status_success(mock_db):
    order = MagicMock()
    order.id = uuid4()
    order.status = OrderStatus.pending

    def set_status(status):
        order.status = OrderStatus(status)
        return order

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = order
    mock_db.execute.return_value = mock_result

    mock_db.commit.side_effect = lambda: setattr(order, 'status', OrderStatus.paid)

    service = OrderService(mock_db)
    updated = await service.update_order_status(order.id, "paid")

    mock_db.commit.assert_called_once()


@pytest.mark.asyncio
async def test_update_order_status_not_found(mock_db):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result

    service = OrderService(mock_db)
    with pytest.raises(HTTPException) as exc:
        await service.update_order_status(uuid4(), "paid")

    assert exc.value.status_code == 404
