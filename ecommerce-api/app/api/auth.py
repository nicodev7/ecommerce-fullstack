from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.auth_service import AuthService
from app.models.user import UserCreate, UserLogin
from app.models.auth import TokenResponse

router = APIRouter()

@router.post("/register")
async def register(req: UserCreate, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    user = await service.register(req.email, req.password)
    return {"message": "User created", "user_id": str(user.id)}

@router.post("/login", response_model=TokenResponse)
async def login(req: UserLogin, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    token = await service.login(req.email, req.password)
    return TokenResponse(access_token=token)
