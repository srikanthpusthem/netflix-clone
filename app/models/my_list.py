import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.profile import Profile
    from app.models.title import Title


class MyList(Base, TimestampMixin):
    """
    A profile's saved/watchlist titles.
    One row per (profile, title) pair — duplicate adds are rejected.
    """

    __tablename__ = "my_list"
    __table_args__ = (
        UniqueConstraint("profile_id", "title_id", name="uq_my_list_profile_title"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("titles.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Relationships
    profile: Mapped["Profile"] = relationship(
        "Profile", back_populates="my_list", lazy="raise"
    )
    title: Mapped["Title"] = relationship(
        "Title", back_populates="my_list_entries", lazy="raise"
    )

    def __repr__(self) -> str:
        return f"<MyList profile={self.profile_id} title={self.title_id}>"
