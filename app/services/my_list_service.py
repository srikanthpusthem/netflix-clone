import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import ConflictError, NotFoundError
from app.dependencies.pagination import PaginationParams
from app.models.my_list import MyList
from app.models.title import Title
from app.schemas.common import PaginatedResponse
from app.schemas.my_list import MyListAddRequest, MyListItemResponse
from app.services.profile_service import _get_owned_profile


async def add_to_list(
    profile_id: uuid.UUID,
    user_id: uuid.UUID,
    payload: MyListAddRequest,
    db: AsyncSession,
) -> MyListItemResponse:
    # Ownership check
    await _get_owned_profile(profile_id, user_id, db)

    # Title must exist
    title = await db.get(Title, payload.title_id)
    if title is None:
        raise NotFoundError("Title")

    # Duplicate check
    existing = await db.scalar(
        select(MyList).where(
            MyList.profile_id == profile_id,
            MyList.title_id == payload.title_id,
        )
    )
    if existing is not None:
        raise ConflictError("This title is already in your list.")

    entry = MyList(
        id=uuid.uuid4(),
        profile_id=profile_id,
        title_id=payload.title_id,
    )
    db.add(entry)
    await db.flush()

    # Reload with title to satisfy selectinload for the enriched response
    loaded = await db.scalar(
        select(MyList)
        .where(MyList.id == entry.id)
        .options(selectinload(MyList.title))
    )
    return MyListItemResponse.model_validate(loaded)


async def remove_from_list(
    profile_id: uuid.UUID,
    user_id: uuid.UUID,
    title_id: uuid.UUID,
    db: AsyncSession,
) -> None:
    # Ownership check
    await _get_owned_profile(profile_id, user_id, db)

    entry = await db.scalar(
        select(MyList).where(
            MyList.profile_id == profile_id,
            MyList.title_id == title_id,
        )
    )
    if entry is None:
        raise NotFoundError("Title in list")

    await db.delete(entry)
    await db.flush()


async def get_my_list(
    profile_id: uuid.UUID,
    user_id: uuid.UUID,
    pagination: PaginationParams,
    db: AsyncSession,
) -> PaginatedResponse[MyListItemResponse]:
    # Ownership check
    await _get_owned_profile(profile_id, user_id, db)

    total = await db.scalar(
        select(func.count())
        .select_from(MyList)
        .where(MyList.profile_id == profile_id)
    )

    rows = await db.scalars(
        select(MyList)
        .where(MyList.profile_id == profile_id)
        .options(selectinload(MyList.title))
        .order_by(MyList.created_at.desc())
        .offset(pagination.offset)
        .limit(pagination.limit)
    )

    return PaginatedResponse.create(
        items=[MyListItemResponse.model_validate(r) for r in rows],
        total=total or 0,
        page=pagination.page,
        page_size=pagination.page_size,
    )
