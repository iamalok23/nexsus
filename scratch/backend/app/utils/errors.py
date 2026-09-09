"""Custom exceptions and centralized error handlers."""
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException


class NexusException(Exception):
    """Base exception for NEXUS domain errors."""
    def __init__(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST, details: dict = None):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class CaseNotFoundError(NexusException):
    def __init__(self, case_id: str):
        super().__init__(
            message=f"Investigation case with ID '{case_id}' was not found.",
            status_code=status.HTTP_404_NOT_FOUND,
            details={"case_id": case_id}
        )


class EntityNotFoundError(NexusException):
    def __init__(self, entity_id: str):
        super().__init__(
            message=f"Entity with ID '{entity_id}' was not found in the investigation database.",
            status_code=status.HTTP_404_NOT_FOUND,
            details={"entity_id": entity_id}
        )


class InvalidUploadError(NexusException):
    def __init__(self, message: str, details: dict = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            details=details or {}
        )


def register_error_handlers(app: FastAPI) -> None:
    """Register centralized error handlers on the FastAPI app."""

    @app.exception_handler(NexusException)
    async def nexus_exception_handler(request: Request, exc: NexusException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": {
                    "type": exc.__class__.__name__,
                    "message": exc.message,
                    "details": exc.details
                }
            }
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": {
                    "type": "HTTPException",
                    "message": exc.detail if isinstance(exc.detail, str) else "HTTP error occurred.",
                    "details": exc.detail if isinstance(exc.detail, dict) else {"status_code": exc.status_code}
                }
            }
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "success": False,
                "error": {
                    "type": "ValidationError",
                    "message": "Input validation failed. Please check request parameters or body.",
                    "details": exc.errors()
                }
            }
        )
