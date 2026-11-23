"""Seed demo users (one investigator, one QA approver). Run: python -m app.seed"""

import uuid

from app.core.database import SessionLocal
from app.domain.enums import Role
from app.models import User

DEMO_USERS = [
    User(id=uuid.UUID("00000000-0000-0000-0000-000000000001"), name="Demo Investigator",
         email="investigator@example.com", role=Role.INVESTIGATOR),
    User(id=uuid.UUID("00000000-0000-0000-0000-000000000002"), name="Demo QA Approver",
         email="qa@example.com", role=Role.QA_APPROVER),
]


def main() -> None:
    with SessionLocal() as db:
        for user in DEMO_USERS:
            db.merge(user)
        db.commit()
    print(f"Seeded {len(DEMO_USERS)} users")


if __name__ == "__main__":
    main()
