import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AuthenticationError, ConflictError
from app.core.security import (
    TokenType,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import AccessTokenResponse, TokenResponse
from app.schemas.user import UserCreate, UserResponse


async def register_user(payload: UserCreate, db: AsyncSession) -> UserResponse:
    """
    Create a new user account.
    Raises ConflictError if the email is already registered.
    """
    existing = await db.scalar(select(User).where(User.email == payload.email))
    if existing is not None:
        raise ConflictError("An account with this email already exists.")

    user = User(
        id=uuid.uuid4(),
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    await db.flush()  # populate DB-generated fields (created_at) before returning
    return UserResponse.model_validate(user)


async def login_user(email: str, password: str, db: AsyncSession) -> TokenResponse:
    """
    Authenticate a user and return an access + refresh token pair.
    Raises AuthenticationError on bad credentials (deliberately vague).
    """
    user = await db.scalar(select(User).where(User.email == email))

    # Always run verify_password even on miss to prevent timing attacks.
    password_ok = verify_password(password, user.hashed_password) if user else False

    if not user or not password_ok or not user.is_active:
        raise AuthenticationError("Invalid email or password.")

    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


async def refresh_access_token(refresh_token: str, db: AsyncSession) -> AccessTokenResponse:
    """
    Validate a refresh token and issue a new access token.
    Raises AuthenticationError if the token is invalid or the user is gone.
    """
    try:
        user_id = decode_token(refresh_token, expected_type=TokenType.REFRESH)
    except ValueError as exc:
        raise AuthenticationError(str(exc)) from exc

    user = await db.get(User, uuid.UUID(user_id))
    if user is None or not user.is_active:
        raise AuthenticationError("User not found or inactive.")

    return AccessTokenResponse(access_token=create_access_token(str(user.id)))
