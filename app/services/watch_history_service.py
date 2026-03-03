import uuid
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundError
from app.dependencies.pagination import PaginationParams
from app.models.title import Title
from app.models.watch_history import WatchHistory
from app.schemas.common import PaginatedResponse
from app.schemas.watch_history import (
    ContinueWatchingResponse,
    WatchHistoryResponse,
    WatchProgressUpdate,
)
from app.services.profile_service import _get_owned_profile


async def upsert_progress(
    profile_id: uuid.UUID,
    user_id: uuid.UUID,
    payload: WatchProgressUpdate,
    db: AsyncSession,
) -> WatchHistoryResponse:
    # Ownership check
    await _get_owned_profile(profile_id, user_id, db)

    # Title must exist
    title = await db.get(Title, payload.title_id)
    if title is None:
        raise NotFoundError("Title")

    existing = await db.scalar(
        select(WatchHistory).where(
            WatchHistory.profile_id == profile_id,
            WatchHistory.title_id == payload.title_id,
        )
    )

    now = datetime.now(tz=timezone.utc)

    if existing:
        existing.progress_seconds = payload.progress_seconds
        existing.last_watched_at = now
        await db.flush()
        return WatchHistoryResponse.model_validate(existing)

    entry = WatchHistory(
        id=uuid.uuid4(),
        profile_id=profile_id,
        title_id=payload.title_id,
        progress_seconds=payload.progress_seconds,
        last_watched_at=now,
    )
    db.add(entry)
    await db.flush()
    return WatchHistoryResponse.model_validate(entry)


async def get_continue_watching(
    profile_id: uuid.UUID,
    user_id: uuid.UUID,
    pagination: PaginationParams,
    db: AsyncSession,
) -> PaginatedResponse[ContinueWatchingResponse]:
    # Ownership check
    await _get_owned_profile(profile_id, user_id, db)

    total = await db.scalar(
        select(func.count())
        .select_from(WatchHistory)
        .where(WatchHistory.profile_id == profile_id)
    )

    rows = await db.scalars(
        select(WatchHistory)
        .where(WatchHistory.profile_id == profile_id)
        .options(selectinload(WatchHistory.title))
        .order_by(WatchHistory.last_watched_at.desc())
        .offset(pagination.offset)
        .limit(pagination.limit)
    )

    return PaginatedResponse.create(
        items=[ContinueWatchingResponse.model_validate(r) for r in rows],
        total=total or 0,
        page=pagination.page,
        page_size=pagination.page_size,
    )
