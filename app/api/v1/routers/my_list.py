import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.dependencies.pagination import PaginationParams
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.my_list import MyListAddRequest, MyListItemResponse
from app.services import my_list_service

router = APIRouter(prefix="/profiles/{profile_id}/my-list", tags=["My List"])


@router.post("", response_model=MyListItemResponse, status_code=status.HTTP_201_CREATED)
async def add_to_list(
    profile_id: uuid.UUID,
    payload: MyListAddRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MyListItemResponse:
    return await my_list_service.add_to_list(profile_id, current_user.id, payload, db)


@router.delete("/{title_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_list(
    profile_id: uuid.UUID,
    title_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await my_list_service.remove_from_list(profile_id, current_user.id, title_id, db)


@router.get("", response_model=PaginatedResponse[MyListItemResponse])
async def get_my_list(
    profile_id: uuid.UUID,
    pagination: PaginationParams = Depends(),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[MyListItemResponse]:
    return await my_list_service.get_my_list(profile_id, current_user.id, pagination, db)
