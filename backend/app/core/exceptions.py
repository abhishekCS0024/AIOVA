"""Domain exceptions and their HTTP mapping."""

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse


class DomainError(Exception):
    status_code = status.HTTP_400_BAD_REQUEST

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


class NotFoundError(DomainError):
    status_code = status.HTTP_404_NOT_FOUND


class ComplianceRuleViolation(DomainError):
    """Raised when a human-in-the-loop / GMP rule (docs §11) would be broken."""

    status_code = status.HTTP_409_CONFLICT


class PermissionDenied(DomainError):
    status_code = status.HTTP_403_FORBIDDEN


class AIServiceError(DomainError):
    """The LLM provider failed or kept returning unusable output."""

    status_code = status.HTTP_503_SERVICE_UNAVAILABLE


class DocumentParseError(DomainError):
    status_code = status.HTTP_422_UNPROCESSABLE_CONTENT


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(DomainError)
    async def _handle(_: Request, exc: DomainError) -> JSONResponse:
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})
