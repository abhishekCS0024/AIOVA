"""Append-only audit trail (rule 5): who, what, when, and whether AI or a user."""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domain.enums import ChangeSource
from app.models.audit_log import AuditLog


def record(
    db: Session,
    *,
    investigation_id: uuid.UUID,
    action: str,
    source: ChangeSource,
    user_id: uuid.UUID | None = None,
    entity: str | None = None,
    entity_id: uuid.UUID | None = None,
    field: str | None = None,
    old_value=None,
    new_value=None,
) -> AuditLog:
    entry = AuditLog(
        investigation_id=investigation_id,
        user_id=user_id,
        action=action,
        entity=entity,
        entity_id=entity_id,
        field=field,
        old_value=old_value,
        new_value=new_value,
        source=source,
    )
    db.add(entry)
    return entry


def list_for_investigation(db: Session, investigation_id: uuid.UUID) -> list[AuditLog]:
    stmt = (
        select(AuditLog)
        .where(AuditLog.investigation_id == investigation_id)
        .order_by(AuditLog.at)
    )
    return list(db.scalars(stmt))
