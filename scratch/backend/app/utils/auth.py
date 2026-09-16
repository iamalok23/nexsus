"""Firebase Authentication Dependency for FastAPI Backend.

Verifies Firebase ID tokens from 'Authorization: Bearer <token>' header
using Firebase Admin SDK. Fails closed when credentials are missing or invalid.
Tokens and credentials are never logged.
"""
import os
import logging
from typing import Optional, Dict, Any

import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
from google.auth.exceptions import DefaultCredentialsError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.utils.config import settings

logger = logging.getLogger("nexus.auth")

# HTTP Bearer scheme for OpenAPI docs and token extraction
bearer_scheme = HTTPBearer(auto_error=False)

_firebase_app: Optional[firebase_admin.App] = None
_init_error: Optional[str] = None


def get_firebase_app() -> Optional[firebase_admin.App]:
    """Initialize or retrieve the Firebase Admin application instance.
    
    Fails closed if credentials cannot be found or configured.
    """
    global _firebase_app, _init_error

    if _firebase_app is not None:
        return _firebase_app

    # Check if an existing app is already initialized in firebase_admin
    try:
        _firebase_app = firebase_admin.get_app()
        return _firebase_app
    except ValueError:
        pass  # App not yet initialized

    cert_path = settings.FIREBASE_CREDENTIALS_PATH or os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
    if cert_path and not os.path.isabs(cert_path) and not os.path.exists(cert_path):
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        candidate = os.path.join(backend_dir, cert_path)
        if os.path.exists(candidate):
            cert_path = candidate

    try:
        if cert_path and os.path.exists(cert_path):
            cred = credentials.Certificate(cert_path)
            _firebase_app = firebase_admin.initialize_app(
                cred,
                {"projectId": settings.FIREBASE_PROJECT_ID}
            )
            logger.info("Firebase Admin initialized with certificate credentials.")
            return _firebase_app
        elif settings.FIREBASE_PROJECT_ID:
            # Attempt default application credentials if available in cloud/container environment
            try:
                cred = credentials.ApplicationDefault()
                _firebase_app = firebase_admin.initialize_app(
                    cred,
                    {"projectId": settings.FIREBASE_PROJECT_ID}
                )
                logger.info("Firebase Admin initialized with Application Default Credentials.")
                return _firebase_app
            except Exception as adc_err:
                _init_error = (
                    "Firebase Admin credentials not found. Set FIREBASE_CREDENTIALS_PATH "
                    "or GOOGLE_APPLICATION_CREDENTIALS pointing to a service account JSON file."
                )
                logger.warning("Firebase Admin initialization failed: %s", _init_error)
                return None
        else:
            _init_error = "FIREBASE_PROJECT_ID is not configured."
            logger.warning(_init_error)
            return None
    except Exception as e:
        _init_error = f"Failed to initialize Firebase Admin: {str(e)}"
        logger.error("Firebase Admin initialization exception encountered.")
        return None


async def get_current_user(
    auth_credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme)
) -> Dict[str, Any]:
    """FastAPI dependency to verify Firebase ID tokens.
    
    Requires 'Authorization: Bearer <token>' header.
    Fails closed with HTTP 401 Unauthorized if token is missing, expired, or invalid,
    or if backend Firebase Admin credentials are unconfigured.
    """
    if not auth_credentials or not auth_credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication credentials. Expected 'Authorization: Bearer <token>'.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    token = auth_credentials.credentials.strip()

    app_instance = get_firebase_app()
    if app_instance is None:
        # Fail closed: Do not allow unauthorized bypass when admin credentials are missing
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "Authentication failed: Backend Firebase Admin credentials not configured. "
                "Set FIREBASE_CREDENTIALS_PATH or GOOGLE_APPLICATION_CREDENTIALS in backend environment."
            ),
            headers={"WWW-Authenticate": "Bearer"}
        )

    try:
        decoded_token = firebase_auth.verify_id_token(token, app=app_instance)
        return decoded_token
    except DefaultCredentialsError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "Authentication failed: Backend Firebase Admin credentials not configured. "
                "Set FIREBASE_CREDENTIALS_PATH or GOOGLE_APPLICATION_CREDENTIALS in backend environment."
            ),
            headers={"WWW-Authenticate": "Bearer"}
        )
    except firebase_auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firebase authentication token has expired. Please re-authenticate.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except firebase_auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Firebase authentication token.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate authentication credentials.",
            headers={"WWW-Authenticate": "Bearer"}
        )
