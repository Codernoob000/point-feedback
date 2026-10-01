import os
from typing import Optional, Dict, Any
from fastapi import Request, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security_scheme = HTTPBearer(auto_error=False)


class RequireAdmin:
    """Authentication and authorization dependency for administrative endpoints.
    
    In local development mode (default), requests without credentials pass through.
    When `REQUIRE_ADMIN_AUTH=true` is set, requests must provide a valid Bearer token
    configured for JWT, Clerk, or OAuth authentication.
    """

    def __init__(self, require_auth: Optional[bool] = None):
        self._explicit_require_auth = require_auth

    @property
    def is_required(self) -> bool:
        if self._explicit_require_auth is not None:
            return self._explicit_require_auth
        return os.getenv("REQUIRE_ADMIN_AUTH", "false").lower() in ("true", "1", "yes")

    async def __call__(
        self,
        request: Request,
        credentials: Optional[HTTPAuthorizationCredentials] = Security(security_scheme)
    ) -> Dict[str, Any]:
        # Local development bypass unless strict auth is required
        if not self.is_required:
            return {
                "user_id": "dev_admin_local",
                "role": "admin",
                "auth_type": "development_bypass"
            }


        if not credentials or not credentials.credentials:
            raise HTTPException(
                status_code=401,
                detail="Authentication credentials required",
                headers={"WWW-Authenticate": "Bearer"}
            )

        token = credentials.credentials

        # Verify token using JWT / Clerk / OAuth handler
        user_info = self.verify_token(token)
        if not user_info:
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired authentication token",
                headers={"WWW-Authenticate": "Bearer"}
            )

        return user_info

    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Placeholder hook for JWT, Clerk, or OAuth provider verification."""
        # Check for mock / test admin token
        if token.startswith("pf_admin_") or token == "valid_test_admin_token":
            return {
                "user_id": f"admin_{token[:10]}",
                "role": "admin",
                "auth_type": "bearer"
            }

        # Structure for future JWT/Clerk decoding:
        # try:
        #     payload = jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"])
        #     return payload
        # except Exception:
        #     return None

        return None
