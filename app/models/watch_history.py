import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Integer, ForeignKey, DateTime, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.profile import Profile
    from app.models.title import Title


class WatchHistory(Base):
    """
    Tracks per-profile watch progress for a title.
    One row per (profile, title) pair — upserted on progress update.
    """

    __tablename__ = "watch_history"
    __table_args__ = (
        UniqueConstraint("profile_id", "title_id", name="uq_watch_history_profile_title"),
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
    progress_seconds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_watched_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    profile: Mapped["Profile"] = relationship(
        "Profile", back_populates="watch_history", lazy="raise"
    )
    title: Mapped["Title"] = relationship(
        "Title", back_populates="watch_history", lazy="raise"
    )

    def __repr__(self) -> str:
        return f"<WatchHistory profile={self.profile_id} title={self.title_id} progress={self.progress_seconds}s>"
