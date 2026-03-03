import uuid
from datetime import datetime

from app.schemas.common import AppBaseModel
from app.schemas.title import TitleResponse


class MyListAddRequest(AppBaseModel):
    title_id: uuid.UUID


class MyListResponse(AppBaseModel):
    id: uuid.UUID
    profile_id: uuid.UUID
    title_id: uuid.UUID
    created_at: datetime


class MyListItemResponse(AppBaseModel):
    """Enriched response that includes full title details."""

    id: uuid.UUID
    profile_id: uuid.UUID
    created_at: datetime
    title: TitleResponse
