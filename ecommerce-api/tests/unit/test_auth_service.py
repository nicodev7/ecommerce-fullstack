import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException
from app.services.auth_service import AuthService


@pytest.fixture
def mock_db():
    db = AsyncMock()
    db.execute = AsyncMock()
    db.add = MagicMock()
    db.commit = AsyncMock()
    db.refresh = AsyncMock()
    return db


@pytest.mark.asyncio
async def test_register_new_user(mock_db):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result

    service = AuthService(mock_db)
    with patch("app.services.auth_service.hash_password", return_value="hashed_pw"):
        user = await service.register("test@example.com", "password123")

    assert user.email == "test@example.com"
    assert user.password_hash == "hashed_pw"
    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()


@pytest.mark.asyncio
async def test_register_duplicate_email(mock_db):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = MagicMock()
    mock_db.execute.return_value = mock_result

    service = AuthService(mock_db)
    with pytest.raises(HTTPException) as exc:
        await service.register("existing@example.com", "password123")

    assert exc.value.status_code == 400
    assert "already registered" in exc.value.detail


@pytest.mark.asyncio
async def test_login_invalid_credentials(mock_db):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result

    service = AuthService(mock_db)
    with pytest.raises(HTTPException) as exc:
        await service.login("wrong@example.com", "wrongpass")

    assert exc.value.status_code == 401
