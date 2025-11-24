import logging
import json
from typing import Dict, Any
from .config import LOG_PII_MASKING

logger = logging.getLogger("security_audit")


def _mask_email(email: str) -> str:
    if not email or "@" not in email:
        return email
    
    parts = email.split("@")
    if len(parts) != 2:
        return email
    
    local = parts[0]
    domain = parts[1]
    
    if len(local) <= 3:
        masked_local = local[0] + "**"
    else:
        masked_local = local[:3] + "***"
    
    return f"{masked_local}@{domain}"


def _mask_sensitive_data(payload: Dict[str, Any]) -> Dict[str, Any]:
    if not LOG_PII_MASKING:
        return payload
    
    masked = {}
    
    for key, value in payload.items():
        lower_key = key.lower()
        
        if "email" in lower_key and isinstance(value, str):
            masked[key] = _mask_email(value)
        elif any(word in lower_key for word in ["token", "secret", "password", "key", "api"]):
            if isinstance(value, str) and len(value) > 4:
                masked[key] = f"***{value[-4:]}"
            else:
                masked[key] = "***"
        elif "id" in lower_key and isinstance(value, str) and len(value) > 8:
            masked[key] = f"{value[:4]}***{value[-4:]}"
        else:
            masked[key] = value
    
    return masked


def audit_security_event(event_type: str, payload: Dict[str, Any]):
    try:
        masked_payload = _mask_sensitive_data(payload.copy())
        
        log_entry = {
            "event": event_type,
            "data": masked_payload,
        }
        
        logger.info(json.dumps(log_entry))
    except Exception as e:
        logger.error(f"audit_security_event failed: {e}")
