import uuid
from datetime import datetime

from pydantic import field_validator

from app.schemas.common import AppBaseModel


class TitleCreate(AppBaseModel):
    name: str
    description: str | None = None
    release_year: int | None = None
    duration_minutes: int | None = None
    genre: str | None = None
    thumbnail_url: str | None = None
    video_url: str | None = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Title name cannot be blank.")
        return v

    @field_validator("release_year")
    @classmethod
    def valid_year(cls, v: int | None) -> int | None:
        if v is not None and not (1888 <= v <= 2100):
            raise ValueError("release_year must be between 1888 and 2100.")
        return v

    @field_validator("duration_minutes")
    @classmethod
    def positive_duration(cls, v: int | None) -> int | None:
        if v is not None and v <= 0:
            raise ValueError("duration_minutes must be a positive integer.")
        return v


class TitleUpdate(AppBaseModel):
    name: str | None = None
    description: str | None = None
    release_year: int | None = None
    duration_minutes: int | None = None
    genre: str | None = None
    thumbnail_url: str | None = None
    video_url: str | None = None


class TitleResponse(AppBaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    release_year: int | None
    duration_minutes: int | None
    genre: str | None
    thumbnail_url: str | None
    video_url: str | None
    created_at: datetime
