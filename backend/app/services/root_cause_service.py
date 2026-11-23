import uuid
from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.domain import rules
from app.domain.enums import ChangeSource, Role, RootCauseStatus
from app.models import RootCause, User
from app.schemas.root_cause import RootCauseUpdate
from app.services import audit_service


def update(db: Session, root_cause_id: uuid.UUID, data: RootCauseUpdate, user: User) -> RootCause:
    rc = db.get(RootCause, root_cause_id)
    if rc is None:
        raise NotFoundError("Root cause not found")
    rules.ensure_editable(rc.investigation.status)

    changes = data.model_dump(exclude_unset=True, mode="json")
    new_status = changes.pop("status", None)

    for key, value in changes.items():
        old = getattr(rc, key)
        if old != value:
            audit_service.record(
                db, investigation_id=rc.investigation_id, user_id=user.id, action="cause_edit",
                entity="root_cause", entity_id=rc.id, field=key, old_value=old, new_value=value,
                source=ChangeSource.USER,
            )
            setattr(rc, key, value)

    if new_status and new_status != rc.status:
        rules.ensure_transition(
            RootCauseStatus(rc.status), RootCauseStatus(new_status), rules.ROOT_CAUSE_TRANSITIONS
        )
        if new_status == RootCauseStatus.CONFIRMED:
            rules.ensure_can_confirm_root_cause(rc.evidence_refs, Role(user.role))
            rc.confirmed_by, rc.confirmed_at = user.id, datetime.now(UTC)
        audit_service.record(
            db, investigation_id=rc.investigation_id, user_id=user.id,
            action=f"cause_{new_status}", entity="root_cause", entity_id=rc.id, field="status",
            old_value=rc.status, new_value=new_status, source=ChangeSource.USER,
        )
        rc.status = new_status

    return rc
