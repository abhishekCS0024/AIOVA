import uuid

from sqlalchemy.orm import Session

from app.domain import rules
from app.domain.enums import ChangeSource, InvestigationStatus, Role
from app.models import Investigation, User
from app.services import analysis_service, audit_service, investigation_service


def approve(db: Session, investigation_id: uuid.UUID, user: User, comment: str | None):
    """QA sign-off. Role-checked and rule-checked in the backend (rules 2, 3, 6)."""
    inv: Investigation = investigation_service.get(db, investigation_id)
    rules.ensure_qa_approver(Role(user.role))
    rules.ensure_transition(
        InvestigationStatus(inv.status), InvestigationStatus.APPROVED,
        rules.INVESTIGATION_TRANSITIONS,
    )
    rules.ensure_ready_for_approval(inv.root_causes, investigation_service.capa_actions(db, inv))

    # Resume the paused graph so its `save` step completes.
    analysis_service.resume(inv, decision="approve")

    audit_service.record(
        db, investigation_id=inv.id, user_id=user.id, action="approved", field="status",
        old_value=inv.status, new_value={"status": InvestigationStatus.APPROVED, "comment": comment},
        source=ChangeSource.USER,
    )
    inv.status = InvestigationStatus.APPROVED
    inv.version += 1
    return inv
