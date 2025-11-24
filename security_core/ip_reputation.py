import logging
from typing import Dict
import time

logger = logging.getLogger(__name__)

_ip_error_counts: Dict[str, int] = {}
_ip_last_error_time: Dict[str, float] = {}

SUSPICIOUS_ERROR_THRESHOLD = 50

SUSPICIOUS_TIME_WINDOW = 300


def record_error(ip: str):
    current_time = time.time()
    
    last_error = _ip_last_error_time.get(ip, 0)
    if current_time - last_error > SUSPICIOUS_TIME_WINDOW:
        _ip_error_counts[ip] = 0
    
    _ip_error_counts[ip] = _ip_error_counts.get(ip, 0) + 1
    _ip_last_error_time[ip] = current_time
    
    if len(_ip_error_counts) > 1000:
        _cleanup_old_ips()


def is_suspicious_ip(ip: str) -> bool:
    current_time = time.time()
    
    last_error = _ip_last_error_time.get(ip, 0)
    if current_time - last_error > SUSPICIOUS_TIME_WINDOW:
        return False
    
    error_count = _ip_error_counts.get(ip, 0)
    
    return error_count >= SUSPICIOUS_ERROR_THRESHOLD


def _cleanup_old_ips():
    current_time = time.time()
    
    ips_to_delete = [
        ip for ip, last_time in _ip_last_error_time.items()
        if current_time - last_time > SUSPICIOUS_TIME_WINDOW
    ]
    
    for ip in ips_to_delete:
        _ip_error_counts.pop(ip, None)
        _ip_last_error_time.pop(ip, None)
