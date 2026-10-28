
from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class RepositorySnapshot(Base):
    __tablename__ = "repository_snapshots"

    id = Column(Integer, primary_key=True, index=True)

    repository_id = Column(
        Integer,
        ForeignKey("repositories.id"),
        nullable=False,
        index=True
    )

    stars = Column(Integer, nullable=False)
    forks = Column(Integer, nullable=False)
    open_issues = Column(Integer, nullable=False)

    recorded_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
