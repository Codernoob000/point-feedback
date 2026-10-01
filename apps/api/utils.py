import json
from typing import Any, Optional
from fastapi import HTTPException


def parse_json_form(value: Optional[str], default: Any = None) -> Any:
    """Safely parse a JSON string from form data.

    Returns parsed JSON if valid.
    Returns `default` if `value` is None or empty.
    Raises HTTPException(422, "Invalid JSON format") if invalid JSON syntax.
    """
    if value is None:
        return default
    if isinstance(value, str) and value.strip() == "":
        return default
    try:
        return json.loads(value)
    except (json.JSONDecodeError, TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=422,
            detail="Invalid JSON format"
        ) from exc
