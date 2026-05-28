import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4
from fastapi import HTTPException
from app.services.payment_service import PaymentService


@pytest.fixture
def mock_db():
    db = AsyncMock()
    db.execute = AsyncMock()
    db.add = MagicMock()
    db.commit = AsyncMock()
    db.refresh = AsyncMock()
    return db


@pytest.mark.asyncio
async def test_initiate_payment_order_not_found(mock_db):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result

    service = PaymentService(mock_db)
    with pytest.raises(HTTPException) as exc:
        await service.initiate_payment(uuid4(), "card")

    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_initiate_payment_success(mock_db):
    order = MagicMock()
    order.id = uuid4()
    order.total = 99.99

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = order
    mock_db.execute.return_value = mock_result

    mock_db.refresh = AsyncMock()

    service = PaymentService(mock_db)
    payment = await service.initiate_payment(order.id, "card")

    assert payment.amount == 99.99
    assert payment.method == "card"
    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()


@pytest.mark.asyncio
async def test_get_payment_found(mock_db):
    payment = MagicMock()
    payment.id = uuid4()

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = payment
    mock_db.execute.return_value = mock_result

    service = PaymentService(mock_db)
    result = await service.get_payment(payment.id)

    assert result.id == payment.id


@pytest.mark.asyncio
async def test_get_payment_not_found(mock_db):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result

    service = PaymentService(mock_db)
    with pytest.raises(HTTPException) as exc:
        await service.get_payment(uuid4())

    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_simulate_payment_full_flow(mock_db):
    payment = MagicMock()
    payment.id = uuid4()
    payment.order_id = uuid4()

    order = MagicMock()
    order.id = payment.order_id

    def scalar_one_or_none_side_effect(*args, **kwargs):
        if mock_db.execute.call_count <= 1:
            return payment
        return order

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.side_effect = scalar_one_or_none_side_effect
    mock_db.execute.return_value = mock_result
    mock_db.refresh = AsyncMock()

    with patch("asyncio.sleep", AsyncMock()):
        service = PaymentService(mock_db)
        result = await service.simulate_payment(payment.id)

    assert result.id == payment.id
    assert mock_db.commit.call_count >= 2
