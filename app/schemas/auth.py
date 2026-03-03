from pydantic import EmailStr

from app.schemas.common import AppBaseModel


class LoginRequest(AppBaseModel):
    email: EmailStr
    password: str


class TokenResponse(AppBaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(AppBaseModel):
    refresh_token: str


class AccessTokenResponse(AppBaseModel):
    """Returned when a refresh token is exchanged for a new access token."""

    access_token: str
    token_type: str = "bearer"
