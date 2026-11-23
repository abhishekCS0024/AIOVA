"""Human-in-the-loop and compliance rules (docs §11).

These are enforced in the backend, not only the UI. Services call these guards
before mutating state; violations raise ComplianceRuleViolation / PermissionDenied.
"""

from app.core.exceptions import ComplianceRuleViolation, PermissionDenied
from app.domain.enums import (
    CapaStatus,
    InvestigationStatus,
    Role,
    RootCauseStatus,
)

INVESTIGATION_TRANSITIONS: dict[InvestigationStatus, set[InvestigationStatus]] = {
    InvestigationStatus.DRAFT: {InvestigationStatus.IN_REVIEW},
    InvestigationStatus.IN_REVIEW: {InvestigationStatus.DRAFT, InvestigationStatus.APPROVED},
    InvestigationStatus.APPROVED: {InvestigationStatus.CLOSED},
    InvestigationStatus.CLOSED: set(),
}

ROOT_CAUSE_TRANSITIONS: dict[RootCauseStatus, set[RootCauseStatus]] = {
    RootCauseStatus.SUGGESTED: {RootCauseStatus.CONFIRMED, RootCauseStatus.REJECTED},
    RootCauseStatus.CONFIRMED: {RootCauseStatus.SUGGESTED},
    RootCauseStatus.REJECTED: {RootCauseStatus.SUGGESTED},
}

CAPA_TRANSITIONS: dict[CapaStatus, set[CapaStatus]] = {
    CapaStatus.PROPOSED: {CapaStatus.ACCEPTED},
    CapaStatus.ACCEPTED: {CapaStatus.IN_PROGRESS, CapaStatus.PROPOSED},
    CapaStatus.IN_PROGRESS: {CapaStatus.COMPLETED},
    CapaStatus.COMPLETED: {CapaStatus.VERIFIED},
    CapaStatus.VERIFIED: set(),
}


LOCKED_STATUSES = {InvestigationStatus.APPROVED, InvestigationStatus.CLOSED}


def ensure_editable(status: str) -> None:
    """Approved or closed investigations are read-only (data integrity)."""
    if status in LOCKED_STATUSES:
        raise ComplianceRuleViolation(f"Investigation is {status} and can no longer be edited")


def ensure_transition(current, target, transitions: dict) -> None:
    if target != current and target not in transitions.get(current, set()):
        raise ComplianceRuleViolation(f"Cannot move from '{current}' to '{target}'")


def ensure_qa_approver(role: Role) -> None:
    """Rule 3: only a qa_approver may confirm causes or approve an investigation."""
    if role != Role.QA_APPROVER:
        raise PermissionDenied("Only a QA approver can perform this action")


def ensure_can_confirm_root_cause(evidence_refs: list, role: Role) -> None:
    """Rules 2 + 3: confirmation needs at least one evidence reference and a QA approver."""
    ensure_qa_approver(role)
    if not any(ref.get("supports", True) for ref in evidence_refs or []):
        raise ComplianceRuleViolation("A root cause needs supporting evidence before confirmation")


def ensure_capa_linked(root_cause_id) -> None:
    """Rule 6: every CAPA action links to a root cause."""
    if root_cause_id is None:
        raise ComplianceRuleViolation("A CAPA action must be linked to a root cause")


def ensure_ready_for_approval(root_causes: list, capa_actions: list) -> None:
    """An investigation can be approved only with a confirmed cause and linked CAPA."""
    if not any(rc.status == RootCauseStatus.CONFIRMED for rc in root_causes):
        raise ComplianceRuleViolation("At least one root cause must be confirmed")
    if not capa_actions:
        raise ComplianceRuleViolation("At least one CAPA action is required")
