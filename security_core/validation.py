import re
import logging
from typing import Dict, List, Tuple, Optional

logger = logging.getLogger(__name__)

MAX_STRING_LENGTH = 10000

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')


def sanitize_str(value: str, max_length: int = MAX_STRING_LENGTH) -> str:
    if not isinstance(value, str):
        return ""
    
    sanitized = value.strip()
    
    sanitized = sanitized[:max_length]
    
    sanitized = re.sub(r'[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]', '', sanitized)
    
    return sanitized


def require_fields(data: Dict, fields: List[str]) -> Tuple[bool, Optional[str]]:
    if not isinstance(data, dict):
        return (False, "Data must be a dictionary")
    
    missing = []
    for field in fields:
        if field not in data or data[field] is None or (isinstance(data[field], str) and not data[field].strip()):
            missing.append(field)
    
    if missing:
        return (False, f"Missing required fields: {', '.join(missing)}")
    
    return (True, None)


def is_valid_email(value: str) -> bool:
    if not isinstance(value, str):
        return False
    
    value = value.strip()
    
    if len(value) > 320:
        return False
    
    return bool(EMAIL_REGEX.match(value))
