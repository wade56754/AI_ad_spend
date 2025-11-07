# unified response helpers
from typing import Any, Dict, Optional


def success(data: Any = None, meta: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    return {
        'data': data,
        'error': None,
        'meta': meta or {},
    }


def failure(message: str, meta: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    return {
        'data': None,
        'error': message,
        'meta': meta or {},
    }
