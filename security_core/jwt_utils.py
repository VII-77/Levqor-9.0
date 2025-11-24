import hmac
import hashlib
import json
import time
import logging
from typing import Tuple, Optional, Dict, Any
from .config import SIMPLE_HMAC_SECRET

logger = logging.getLogger(__name__)

DEFAULT_TTL_SECONDS = 900


def sign_payload(payload: Dict[str, Any], ttl_seconds: int = DEFAULT_TTL_SECONDS) -> str:
    try:
        now = int(time.time())
        claims = {
            **payload,
            "iat": now,
            "exp": now + ttl_seconds,
        }
        
        payload_json = json.dumps(claims, sort_keys=True)
        signature = hmac.new(
            SIMPLE_HMAC_SECRET.encode("utf-8"),
            payload_json.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()
        
        token = f"{payload_json}.{signature}"
        return token
    except Exception as e:
        logger.error(f"sign_payload error: {e}")
        return ""


def verify_token(token: str) -> Tuple[bool, Optional[Dict[str, Any]]]:
    try:
        if not token or "." not in token:
            return (False, None)
        
        parts = token.rsplit(".", 1)
        if len(parts) != 2:
            return (False, None)
        
        payload_json, signature = parts
        
        expected_signature = hmac.new(
            SIMPLE_HMAC_SECRET.encode("utf-8"),
            payload_json.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(signature, expected_signature):
            logger.warning("verify_token: signature mismatch")
            return (False, None)
        
        claims = json.loads(payload_json)
        
        now = int(time.time())
        if "exp" in claims and claims["exp"] < now:
            logger.warning("verify_token: token expired")
            return (False, None)
        
        return (True, claims)
    except Exception as e:
        logger.error(f"verify_token error: {e}")
        return (False, None)
