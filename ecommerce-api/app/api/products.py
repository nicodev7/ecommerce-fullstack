from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated
from uuid import UUID
from app.db.session import get_db
from app.core.deps import get_current_user
from app.db.models import User, UserRole
from app.services.product_service import ProductService
from app.models.product import ProductCreate, ProductUpdate, ProductResponse

router = APIRouter()

@router.get("/", response_model=list[ProductResponse])
async def list_products(
    category: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    service = ProductService(db)
    return await service.list_products(category, skip, limit)

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: UUID, db: AsyncSession = Depends(get_db)):
    service = ProductService(db)
    return await service.get_product(product_id)


@router.post("/", response_model=ProductResponse)
async def create_product(
    req: ProductCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    service = ProductService(db)
    return await service.create_product(req.model_dump())

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: UUID,
    req: ProductUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    service = ProductService(db)
    return await service.update_product(product_id, req.model_dump(exclude_none=True))

@router.delete("/{product_id}")
async def delete_product(
    product_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    service = ProductService(db)
    await service.delete_product(product_id)
    return {"message": "Product deleted"}
