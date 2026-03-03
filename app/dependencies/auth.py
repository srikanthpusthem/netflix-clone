import uuid

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AuthenticationError, AuthorizationError
from app.core.security import TokenType, decode_token
from app.dependencies.db import get_db
from app.models.user import User

# Extracts "Bearer <token>" from the Authorization header.
# auto_error=False lets us produce our own error message instead of FastAPI's default.
_bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Resolve the current authenticated user from the Bearer token.
    Raises AuthenticationError (401) if the token is missing, invalid, or expired.
    Raises AuthenticationError (401) if the user no longer exists or is inactive.
    """
    if credentials is None:
        raise AuthenticationError("Authentication credentials were not provided.")

    try:
        user_id = decode_token(credentials.credentials, expected_type=TokenType.ACCESS)
    except ValueError as exc:
        raise AuthenticationError(str(exc)) from exc

    user = await db.get(User, uuid.UUID(user_id))
    if user is None or not user.is_active:
        raise AuthenticationError("User not found or account is inactive.")

    return user


async def get_current_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Like get_current_user but also enforces admin flag.
    Raises AuthorizationError (403) for non-admin users.
    """
    if not current_user.is_admin:
        raise AuthorizationError("Admin privileges required.")
    return current_user
