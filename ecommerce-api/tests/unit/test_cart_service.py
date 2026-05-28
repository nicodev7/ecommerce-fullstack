import pytest
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4
from fastapi import HTTPException
from app.services.cart_service import CartService


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
async def test_get_or_create_cart_returns_existing(mock_db):
    cart_id = uuid4()
    existing_cart = MagicMock()
    existing_cart.id = cart_id
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = existing_cart
    mock_db.execute.return_value = mock_result

    service = CartService(mock_db)
    cart = await service.get_or_create_cart(uuid4())

    assert cart.id == cart_id
    mock_db.add.assert_not_called()


@pytest.mark.asyncio
async def test_get_or_create_cart_creates_new(mock_db):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result

    service = CartService(mock_db)
    user_id = uuid4()
    cart = await service.get_or_create_cart(user_id)

    assert cart.user_id == user_id
    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()


@pytest.mark.asyncio
async def test_add_item_product_not_found(mock_db):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result

    service = CartService(mock_db)
    with pytest.raises(HTTPException) as exc:
        await service.add_item(uuid4(), uuid4(), 1)

    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_add_item_new_item(mock_db):
    product = MagicMock()
    product.id = uuid4()
    product.is_active = True

    cart = MagicMock()
    cart.id = uuid4()

    mock_db.execute.side_effect = [
        AsyncMock(scalar_one_or_none=lambda: product),
        AsyncMock(scalar_one_or_none=lambda: cart),
        AsyncMock(scalar_one_or_none=lambda: None),
    ]

    service = CartService(mock_db)
    await service.add_item(uuid4(), product.id, 2)

    mock_db.add.assert_called_once()


@pytest.mark.asyncio
async def test_remove_item_not_found(mock_db):
    mock_db.execute.return_value.scalar_one_or_none.return_value = MagicMock()
    mock_db.execute.return_value = AsyncMock(scalar_one_or_none=lambda: None)

    service = CartService(mock_db)
    with pytest.raises(HTTPException) as exc:
        await service.remove_item(uuid4(), uuid4())

    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_clear_cart(mock_db):
    cart = MagicMock()
    cart.id = uuid4()

    item = MagicMock()
    item.id = uuid4()

    mock_db.execute.side_effect = [
        AsyncMock(scalar_one_or_none=lambda: cart),
        AsyncMock(scalars=lambda: MagicMock(all=lambda: [item])),
    ]

    service = CartService(mock_db)
    await service.clear_cart(uuid4())

    mock_db.delete.assert_called_once_with(item)
    mock_db.commit.assert_called_once()
