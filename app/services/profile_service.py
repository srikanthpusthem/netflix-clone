import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import AuthorizationError, NotFoundError, ValidationError
from app.models.profile import Profile
from app.schemas.profile import ProfileCreate, ProfileResponse, ProfileUpdate


async def _get_owned_profile(
    profile_id: uuid.UUID,
    user_id: uuid.UUID,
    db: AsyncSession,
) -> Profile:
    """
    Fetch a profile by ID and verify ownership.
    Exported so watch_history_service and my_list_service can reuse it.
    """
    profile = await db.get(Profile, profile_id)
    if profile is None:
        raise NotFoundError("Profile")
    if profile.user_id != user_id:
        raise AuthorizationError("You do not own this profile.")
    return profile


async def create_profile(
    user_id: uuid.UUID,
    payload: ProfileCreate,
    db: AsyncSession,
) -> ProfileResponse:
    count = await db.scalar(
        select(func.count()).select_from(Profile).where(Profile.user_id == user_id)
    )
    if (count or 0) >= settings.MAX_PROFILES_PER_USER:
        raise ValidationError(
            f"Maximum of {settings.MAX_PROFILES_PER_USER} profiles per account reached."
        )

    profile = Profile(
        id=uuid.uuid4(),
        user_id=user_id,
        name=payload.name,
        avatar_url=payload.avatar_url,
        is_kids_profile=payload.is_kids_profile,
    )
    db.add(profile)
    await db.flush()
    return ProfileResponse.model_validate(profile)


async def list_profiles(user_id: uuid.UUID, db: AsyncSession) -> list[ProfileResponse]:
    rows = await db.scalars(
        select(Profile)
        .where(Profile.user_id == user_id)
        .order_by(Profile.created_at)
    )
    return [ProfileResponse.model_validate(p) for p in rows]


async def update_profile(
    profile_id: uuid.UUID,
    user_id: uuid.UUID,
    payload: ProfileUpdate,
    db: AsyncSession,
) -> ProfileResponse:
    profile = await _get_owned_profile(profile_id, user_id, db)

    if payload.name is not None:
        profile.name = payload.name
    if payload.avatar_url is not None:
        profile.avatar_url = payload.avatar_url
    if payload.is_kids_profile is not None:
        profile.is_kids_profile = payload.is_kids_profile

    await db.flush()
    return ProfileResponse.model_validate(profile)


async def delete_profile(
    profile_id: uuid.UUID,
    user_id: uuid.UUID,
    db: AsyncSession,
) -> None:
    profile = await _get_owned_profile(profile_id, user_id, db)
    await db.delete(profile)
    await db.flush()
