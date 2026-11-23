"""Prototype authentication and role checks.

The prototype identifies the user from an `X-User-Id` header (seeded users).
Replace with real auth (OIDC / SSO) before any production use. Validated
electronic signatures (21 CFR Part 11) are out of scope.
"""

import uuid
from collections.abc import Callable
from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.domain.enums import Role
from app.models.user import User


def get_current_user(
    x_user_id: Annotated[uuid.UUID, Header(alias="X-User-Id")],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    user = db.get(User, x_user_id)
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Unknown user")
    return user


def require_role(*roles: Role) -> Callable[[User], User]:
    def checker(user: Annotated[User, Depends(get_current_user)]) -> User:
        if user.role not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Insufficient role")
        return user

    return checker
