"""ORM models. Importing this package registers every table on Base.metadata."""

from app.models.audit_log import AuditLog
from app.models.base import Base
from app.models.capa_action import CapaAction
from app.models.investigation import Investigation
from app.models.root_cause import RootCause
from app.models.source_document import SourceDocument
from app.models.user import User

__all__ = [
    "AuditLog",
    "Base",
    "CapaAction",
    "Investigation",
    "RootCause",
    "SourceDocument",
    "User",
]
