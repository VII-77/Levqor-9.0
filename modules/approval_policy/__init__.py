"""
Approval Policy Module - MEGA PHASE v16
Classifies actions by impact level (A/B/C)
"""
from enum import Enum
from typing import Dict, Any, List


class ImpactLevel(str, Enum):
    SAFE = "A"
    SOFT = "B"
    CRITICAL = "C"


EXTERNAL_DOMAINS_KEYWORDS = [
    "http://", "https://", "api.", "webhook.", 
    "stripe.com", "sendgrid", "mailgun", "twilio"
]

CRITICAL_STEP_TYPES = ["email", "http_request"]
SOFT_STEP_TYPES = ["delay", "condition"]
SAFE_STEP_TYPES = ["log"]


def classify_step(step: Dict[str, Any]) -> ImpactLevel:
    """Classify a single workflow step by impact level."""
    step_type = step.get("type", "log")
    config = step.get("config", {})
    
    if step_type == "email":
        return ImpactLevel.CRITICAL
    
    if step_type == "http_request":
        url = config.get("url", "")
        if any(keyword in url.lower() for keyword in EXTERNAL_DOMAINS_KEYWORDS):
            return ImpactLevel.CRITICAL
        if url.startswith("http://") or url.startswith("https://"):
            return ImpactLevel.CRITICAL
        return ImpactLevel.SOFT
    
    if step_type in SOFT_STEP_TYPES:
        return ImpactLevel.SOFT
    
    return ImpactLevel.SAFE


def classify_workflow(workflow: Dict[str, Any]) -> ImpactLevel:
    """
    Classify a workflow by its overall impact level.
    Returns the highest impact level among all steps.
    """
    steps = workflow.get("steps", [])
    
    if not steps:
        return ImpactLevel.SAFE
    
    max_impact = ImpactLevel.SAFE
    
    for step in steps:
        step_impact = classify_step(step)
        
        if step_impact == ImpactLevel.CRITICAL:
            return ImpactLevel.CRITICAL
        
        if step_impact == ImpactLevel.SOFT:
            max_impact = ImpactLevel.SOFT
    
    return max_impact


def get_impact_description(level: ImpactLevel) -> str:
    """Get human-readable description for impact level."""
    descriptions = {
        ImpactLevel.SAFE: "Safe - internal operations only, no external effects",
        ImpactLevel.SOFT: "Soft impact - logged operations with limited external effects",
        ImpactLevel.CRITICAL: "Critical - involves external services, emails, or financial operations"
    }
    return descriptions.get(level, "Unknown")


def requires_approval(level: ImpactLevel) -> bool:
    """Check if an impact level requires approval."""
    return level == ImpactLevel.CRITICAL
