"""
Auto-Scaling Policy Module - MEGA PHASE v11-v14
Provides logical auto-scaling for rate limiting based on current load

NOTE: This is "logical auto-scaling" for rate limiting, not infrastructure scaling.
Infrastructure-level autoscaling must be configured separately (e.g., Replit Autoscale).
"""
import logging
from typing import Dict
from .config import RATE_LIMIT_DEFAULT

log = logging.getLogger("levqor.scaling_policy")

LOAD_THRESHOLDS = {
    "low": 0.3,
    "medium": 0.6,
    "high": 0.8,
    "critical": 0.95
}

RATE_LIMIT_PROFILES = {
    "low": {
        "default": RATE_LIMIT_DEFAULT * 2,
        "api_chat": 50,
        "api_workflow": 100,
        "api_billing": 30,
        "api_health": 200
    },
    "medium": {
        "default": RATE_LIMIT_DEFAULT,
        "api_chat": 30,
        "api_workflow": 60,
        "api_billing": 20,
        "api_health": 100
    },
    "high": {
        "default": int(RATE_LIMIT_DEFAULT * 0.7),
        "api_chat": 20,
        "api_workflow": 40,
        "api_billing": 15,
        "api_health": 50
    },
    "critical": {
        "default": int(RATE_LIMIT_DEFAULT * 0.5),
        "api_chat": 10,
        "api_workflow": 20,
        "api_billing": 10,
        "api_health": 30
    }
}

_current_load: float = 0.0


def set_current_load(load: float) -> None:
    global _current_load
    _current_load = max(0.0, min(1.0, load))
    log.debug(f"Load updated to {_current_load:.2f}")


def get_current_load() -> float:
    return _current_load


def get_load_tier(load: float = None) -> str:
    if load is None:
        load = _current_load
    
    if load >= LOAD_THRESHOLDS["critical"]:
        return "critical"
    elif load >= LOAD_THRESHOLDS["high"]:
        return "high"
    elif load >= LOAD_THRESHOLDS["medium"]:
        return "medium"
    else:
        return "low"


def choose_rate_limits(current_load: float = None) -> Dict[str, int]:
    if current_load is not None:
        set_current_load(current_load)
    
    tier = get_load_tier()
    limits = RATE_LIMIT_PROFILES.get(tier, RATE_LIMIT_PROFILES["medium"])
    
    log.info(f"Rate limits adjusted for {tier} load (load={_current_load:.2f})")
    return limits


def get_limit_for_endpoint(endpoint: str, current_load: float = None) -> int:
    limits = choose_rate_limits(current_load)
    
    normalized_endpoint = endpoint.lower().replace('/', '_').strip('_')
    
    for key in limits:
        if key in normalized_endpoint:
            return limits[key]
    
    return limits.get("default", RATE_LIMIT_DEFAULT)


def estimate_load_from_requests(requests_per_minute: int, capacity: int = 1000) -> float:
    return min(1.0, requests_per_minute / capacity)
