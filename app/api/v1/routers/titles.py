import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_admin, get_current_user
from app.dependencies.db import get_db
from app.dependencies.pagination import PaginationParams
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.title import TitleCreate, TitleResponse, TitleUpdate
from app.services import title_service

router = APIRouter(prefix="/titles", tags=["Titles"])


@router.post("", response_model=TitleResponse, status_code=status.HTTP_201_CREATED)
async def create_title(
    payload: TitleCreate,
    _: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> TitleResponse:
    return await title_service.create_title(payload, db)


@router.get("", response_model=PaginatedResponse[TitleResponse])
async def list_titles(
    search: str | None = Query(default=None, description="Filter titles by name (case-insensitive)"),
    pagination: PaginationParams = Depends(),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[TitleResponse]:
    return await title_service.list_titles(pagination, db, search=search)


@router.get("/{title_id}", response_model=TitleResponse)
async def get_title(
    title_id: uuid.UUID,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TitleResponse:
    return await title_service.get_title(title_id, db)


@router.patch("/{title_id}", response_model=TitleResponse)
async def update_title(
    title_id: uuid.UUID,
    payload: TitleUpdate,
    _: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> TitleResponse:
    return await title_service.update_title(title_id, payload, db)


@router.delete("/{title_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_title(
    title_id: uuid.UUID,
    _: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> None:
    await title_service.delete_title(title_id, db)
