from app.schemas.common import AppBaseModel, PaginatedResponse
from app.schemas.auth import LoginRequest, TokenResponse, RefreshRequest, AccessTokenResponse
from app.schemas.user import UserCreate, UserResponse
from app.schemas.profile import ProfileCreate, ProfileUpdate, ProfileResponse
from app.schemas.title import TitleCreate, TitleUpdate, TitleResponse
from app.schemas.watch_history import (
    WatchProgressUpdate,
    WatchHistoryResponse,
    ContinueWatchingResponse,
)
from app.schemas.my_list import MyListAddRequest, MyListResponse, MyListItemResponse

__all__ = [
    "AppBaseModel",
    "PaginatedResponse",
    "LoginRequest",
    "TokenResponse",
    "RefreshRequest",
    "AccessTokenResponse",
    "UserCreate",
    "UserResponse",
    "ProfileCreate",
    "ProfileUpdate",
    "ProfileResponse",
    "TitleCreate",
    "TitleUpdate",
    "TitleResponse",
    "WatchProgressUpdate",
    "WatchHistoryResponse",
    "ContinueWatchingResponse",
    "MyListAddRequest",
    "MyListResponse",
    "MyListItemResponse",
]
