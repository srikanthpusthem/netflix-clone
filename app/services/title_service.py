import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.dependencies.pagination import PaginationParams
from app.models.title import Title
from app.schemas.common import PaginatedResponse
from app.schemas.title import TitleCreate, TitleResponse, TitleUpdate


async def create_title(payload: TitleCreate, db: AsyncSession) -> TitleResponse:
    title = Title(
        id=uuid.uuid4(),
        name=payload.name,
        description=payload.description,
        release_year=payload.release_year,
        duration_minutes=payload.duration_minutes,
        genre=payload.genre,
        thumbnail_url=payload.thumbnail_url,
        video_url=payload.video_url,
    )
    db.add(title)
    await db.flush()
    return TitleResponse.model_validate(title)


async def list_titles(
    pagination: PaginationParams,
    db: AsyncSession,
    search: str | None = None,
) -> PaginatedResponse[TitleResponse]:
    base_where = []
    if search:
        base_where.append(Title.name.ilike(f"%{search}%"))

    total = await db.scalar(
        select(func.count()).select_from(Title).where(*base_where)
    )

    rows = await db.scalars(
        select(Title)
        .where(*base_where)
        .order_by(Title.created_at.desc())
        .offset(pagination.offset)
        .limit(pagination.limit)
    )

    return PaginatedResponse.create(
        items=[TitleResponse.model_validate(t) for t in rows],
        total=total or 0,
        page=pagination.page,
        page_size=pagination.page_size,
    )


async def get_title(title_id: uuid.UUID, db: AsyncSession) -> TitleResponse:
    title = await db.get(Title, title_id)
    if title is None:
        raise NotFoundError("Title")
    return TitleResponse.model_validate(title)


async def update_title(
    title_id: uuid.UUID,
    payload: TitleUpdate,
    db: AsyncSession,
) -> TitleResponse:
    title = await db.get(Title, title_id)
    if title is None:
        raise NotFoundError("Title")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(title, field, value)

    await db.flush()
    return TitleResponse.model_validate(title)


async def delete_title(title_id: uuid.UUID, db: AsyncSession) -> None:
    title = await db.get(Title, title_id)
    if title is None:
        raise NotFoundError("Title")
    await db.delete(title)
    await db.flush()
