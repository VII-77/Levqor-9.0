import time
import logging
from typing import Dict, Tuple
from .config import RATE_LIMIT_DEFAULT, RATE_LIMIT_WINDOW_SECONDS

logger = logging.getLogger(__name__)

_rate_store: Dict[Tuple[str, str, int], int] = {}


def _get_time_bucket() -> int:
    return int(time.time() / RATE_LIMIT_WINDOW_SECONDS)


def _cleanup_old_buckets():
    current_bucket = _get_time_bucket()
    cutoff_bucket = current_bucket - 5
    
    keys_to_delete = [
        key for key in _rate_store.keys()
        if key[2] < cutoff_bucket
    ]
    
    for key in keys_to_delete:
        del _rate_store[key]


def check_rate_limit(ip: str, path: str, limit: int = RATE_LIMIT_DEFAULT) -> bool:
    bucket = _get_time_bucket()
    key = (ip, path, bucket)
    
    current_count = _rate_store.get(key, 0)
    
    if current_count >= limit:
        logger.warning(f"Rate limit exceeded: ip={ip}, path={path}, count={current_count}, limit={limit}")
        return False
    
    return True


def record_hit(ip: str, path: str):
    bucket = _get_time_bucket()
    key = (ip, path, bucket)
    
    _rate_store[key] = _rate_store.get(key, 0) + 1
    
    if len(_rate_store) > 10000:
        _cleanup_old_buckets()
