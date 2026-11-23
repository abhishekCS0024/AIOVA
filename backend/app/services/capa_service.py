import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.domain import rules
from app.domain.enums import CapaStatus, ChangeSource
from app.models import CapaAction, RootCause, User
from app.schemas.capa import CapaUpdate
from app.services import audit_service


def update(db: Session, capa_id: uuid.UUID, data: CapaUpdate, user: User) -> CapaAction:
    capa = db.get(CapaAction, capa_id)
    if capa is None:
        raise NotFoundError("CAPA action not found")
    root_cause = db.get(RootCause, capa.root_cause_id)
    investigation_id = root_cause.investigation_id

    changes = data.model_dump(exclude_unset=True, mode="json")
    # After approval, CAPA content is locked but its status keeps moving (implementation tracking).
    if set(changes) - {"status"}:
        rules.ensure_editable(root_cause.investigation.status)
    if "root_cause_id" in changes:
        rules.ensure_capa_linked(changes["root_cause_id"])
    if "status" in changes:
        rules.ensure_transition(
            CapaStatus(capa.status), CapaStatus(changes["status"]), rules.CAPA_TRANSITIONS
        )

    for key, value in changes.items():
        old = getattr(capa, key)
        if str(old) != str(value):
            audit_service.record(
                db, investigation_id=investigation_id, user_id=user.id, action="capa_edit",
                entity="capa", entity_id=capa.id, field=key, old_value=str(old),
                new_value=str(value), source=ChangeSource.USER,
            )
            setattr(capa, key, value)
    return capa
