import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import ComplianceRuleViolation, NotFoundError
from app.domain import rules
from app.domain.enums import ChangeSource, InvestigationStatus
from app.models import CapaAction, Investigation, RootCause, User
from app.schemas.investigation import InvestigationCreate, InvestigationUpdate
from app.services import audit_service


def create(db: Session, data: InvestigationCreate, user: User) -> Investigation:
    exists = db.scalar(select(Investigation.id).where(Investigation.deviation_no == data.deviation_no))
    if exists:
        raise ComplianceRuleViolation(f"Deviation {data.deviation_no} already has an investigation")
    inv = Investigation(deviation_no=data.deviation_no, title=data.title, owner_id=user.id)
    db.add(inv)
    db.flush()
    audit_service.record(
        db, investigation_id=inv.id, user_id=user.id, action="created", source=ChangeSource.USER
    )
    return inv


def list_all(db: Session) -> list[Investigation]:
    return list(db.scalars(select(Investigation).order_by(Investigation.created_at.desc())))


def get(db: Session, investigation_id: uuid.UUID) -> Investigation:
    inv = db.get(Investigation, investigation_id)
    if inv is None:
        raise NotFoundError("Investigation not found")
    return inv


def capa_actions(db: Session, inv: Investigation) -> list[CapaAction]:
    stmt = select(CapaAction).join(RootCause).where(RootCause.investigation_id == inv.id)
    return list(db.scalars(stmt))


def update(db: Session, investigation_id: uuid.UUID, data: InvestigationUpdate, user: User):
    """Apply user edits. `ai_draft` is never touched (rule 7); every change is audited."""
    inv = get(db, investigation_id)
    changes = data.model_dump(exclude_unset=True)
    if changes != {"status": InvestigationStatus.CLOSED}:
        rules.ensure_editable(inv.status)

    if "status" in changes:
        rules.ensure_transition(
            InvestigationStatus(inv.status), changes["status"], rules.INVESTIGATION_TRANSITIONS
        )

    if "form_data" in changes:
        new_form = {**inv.form_data, **changes.pop("form_data")}
        for key, value in new_form.items():
            if inv.form_data.get(key) != value:
                audit_service.record(
                    db, investigation_id=inv.id, user_id=user.id, action="field_edit",
                    entity="investigation", entity_id=inv.id, field=f"form_data.{key}",
                    old_value=inv.form_data.get(key), new_value=value, source=ChangeSource.USER,
                )
        inv.form_data = new_form

    for key, value in changes.items():
        old = getattr(inv, key)
        if old != value:
            audit_service.record(
                db, investigation_id=inv.id, user_id=user.id, action="field_edit",
                entity="investigation", entity_id=inv.id, field=key,
                old_value=old, new_value=value, source=ChangeSource.USER,
            )
            setattr(inv, key, value)

    inv.version += 1
    return inv
