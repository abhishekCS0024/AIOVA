import pytest

from app.core.exceptions import ComplianceRuleViolation, PermissionDenied
from app.domain import rules
from app.domain.enums import InvestigationStatus, Role


def test_confirm_requires_qa_approver():
    with pytest.raises(PermissionDenied):
        rules.ensure_can_confirm_root_cause([{"quote": "x", "supports": True}], Role.INVESTIGATOR)


def test_confirm_requires_supporting_evidence():
    with pytest.raises(ComplianceRuleViolation):
        rules.ensure_can_confirm_root_cause([], Role.QA_APPROVER)


def test_confirm_allowed_with_evidence_and_role():
    rules.ensure_can_confirm_root_cause([{"quote": "x", "supports": True}], Role.QA_APPROVER)


def test_capa_must_link_to_cause():
    with pytest.raises(ComplianceRuleViolation):
        rules.ensure_capa_linked(None)


def test_cannot_skip_review():
    with pytest.raises(ComplianceRuleViolation):
        rules.ensure_transition(
            InvestigationStatus.DRAFT, InvestigationStatus.APPROVED,
            rules.INVESTIGATION_TRANSITIONS,
        )


def test_approved_investigation_is_locked():
    with pytest.raises(ComplianceRuleViolation):
        rules.ensure_editable(InvestigationStatus.APPROVED)
    rules.ensure_editable(InvestigationStatus.IN_REVIEW)
