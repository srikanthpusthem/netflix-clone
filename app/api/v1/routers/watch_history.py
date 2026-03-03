import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.dependencies.pagination import PaginationParams
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.watch_history import (
    ContinueWatchingResponse,
    WatchHistoryResponse,
    WatchProgressUpdate,
)
from app.services import watch_history_service

router = APIRouter(prefix="/profiles/{profile_id}/watch-history", tags=["Watch History"])


@router.put("", response_model=WatchHistoryResponse)
async def upsert_progress(
    profile_id: uuid.UUID,
    payload: WatchProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WatchHistoryResponse:
    return await watch_history_service.upsert_progress(
        profile_id, current_user.id, payload, db
    )


@router.get(
    "/continue-watching",
    response_model=PaginatedResponse[ContinueWatchingResponse],
)
async def get_continue_watching(
    profile_id: uuid.UUID,
    pagination: PaginationParams = Depends(),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[ContinueWatchingResponse]:
    return await watch_history_service.get_continue_watching(
        profile_id, current_user.id, pagination, db
    )
