import uuid
from datetime import datetime

from pydantic import field_validator

from app.schemas.common import AppBaseModel
from app.schemas.title import TitleResponse


class WatchProgressUpdate(AppBaseModel):
    title_id: uuid.UUID
    progress_seconds: int

    @field_validator("progress_seconds")
    @classmethod
    def non_negative(cls, v: int) -> int:
        if v < 0:
            raise ValueError("progress_seconds cannot be negative.")
        return v


class WatchHistoryResponse(AppBaseModel):
    id: uuid.UUID
    profile_id: uuid.UUID
    title_id: uuid.UUID
    progress_seconds: int
    last_watched_at: datetime


class ContinueWatchingResponse(AppBaseModel):
    """Enriched response that includes title details alongside progress."""

    id: uuid.UUID
    profile_id: uuid.UUID
    progress_seconds: int
    last_watched_at: datetime
    title: TitleResponse
