import uuid
from datetime import datetime

from pydantic import HttpUrl, field_validator

from app.schemas.common import AppBaseModel


class ProfileCreate(AppBaseModel):
    name: str
    avatar_url: str | None = None
    is_kids_profile: bool = False

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Profile name cannot be blank.")
        if len(v) > 100:
            raise ValueError("Profile name cannot exceed 100 characters.")
        return v


class ProfileUpdate(AppBaseModel):
    name: str | None = None
    avatar_url: str | None = None
    is_kids_profile: bool | None = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("Profile name cannot be blank.")
            if len(v) > 100:
                raise ValueError("Profile name cannot exceed 100 characters.")
        return v


class ProfileResponse(AppBaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    avatar_url: str | None
    is_kids_profile: bool
    created_at: datetime
