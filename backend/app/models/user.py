from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.domain.enums import Role
from app.models.base import Base, Timestamps, UUIDPrimaryKey


class User(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "users"

    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str | None] = mapped_column(String(255), unique=True)
    role: Mapped[str] = mapped_column(String(32), default=Role.INVESTIGATOR)
