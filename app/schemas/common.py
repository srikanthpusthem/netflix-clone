from typing import Generic, TypeVar
from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class AppBaseModel(BaseModel):
    """Root base model — sets shared config for all schemas."""

    model_config = ConfigDict(
        from_attributes=True,   # ORM model → schema (replaces orm_mode)
        populate_by_name=True,  # allow field name or alias
    )


class PaginatedResponse(AppBaseModel, Generic[T]):
    """Generic paginated envelope returned by all list endpoints."""

    items: list[T]
    total: int
    page: int
    page_size: int
    pages: int

    @classmethod
    def create(
        cls,
        items: list[T],
        total: int,
        page: int,
        page_size: int,
    ) -> "PaginatedResponse[T]":
        pages = max(1, -(-total // page_size))  # ceiling division
        return cls(items=items, total=total, page=page, page_size=page_size, pages=pages)
