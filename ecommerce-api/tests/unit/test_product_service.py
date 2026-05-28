import pytest
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4
from fastapi import HTTPException
from app.services.product_service import ProductService


@pytest.fixture
def mock_db():
    db = AsyncMock()
    db.execute = AsyncMock()
    db.add = MagicMock()
    db.commit = AsyncMock()
    db.refresh = AsyncMock()
    return db


@pytest.mark.asyncio
async def test_list_products(mock_db):
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = []
    mock_db.execute.return_value = mock_result

    service = ProductService(mock_db)
    products = await service.list_products()

    assert products == []


@pytest.mark.asyncio
async def test_get_product_not_found(mock_db):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result

    service = ProductService(mock_db)
    with pytest.raises(HTTPException) as exc:
        await service.get_product(uuid4())

    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_create_product(mock_db):
    mock_result = MagicMock()
    mock_db.execute.return_value = mock_result

    service = ProductService(mock_db)
    product_data = {"name": "Test Product", "price": 19.99, "stock": 10}
    product = await service.create_product(product_data)

    assert product.name == "Test Product"
    assert product.price == 19.99
    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()
