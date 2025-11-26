"""
Launch Stage Configuration - Phase 60

Centralizes the LEVQOR_LAUNCH_STAGE environment variable handling.
This controls whether the platform runs in pre-launch (dry-run) or post-launch (live) mode.

Modes:
- "pre" (default): Dry-run mode
    * Growth organism generates proposals but doesn't execute
    * No external API calls for content posting
    * No Git pushes from autopilot
    * High-risk actions queued for approval

- "post": Live autonomous mode
    * Growth organism can execute low-risk actions
    * Content can be posted to allowed channels (if API keys exist)
    * Git commits allowed for passing CI mutations
    * High-risk actions STILL require approval (no change)
"""

import os
import logging
from typing import Literal

log = logging.getLogger("levqor.launch_stage")

LaunchStage = Literal["pre", "post"]

_VALID_STAGES = ("pre", "post")
_DEFAULT_STAGE: LaunchStage = "pre"


def get_launch_stage() -> LaunchStage:
    """
    Get the current launch stage from environment.
    
    Returns:
        "pre" or "post"
    
    Environment Variable:
        LEVQOR_LAUNCH_STAGE - Set to "pre" or "post"
    """
    stage = os.environ.get("LEVQOR_LAUNCH_STAGE", _DEFAULT_STAGE).lower().strip()
    
    if stage not in _VALID_STAGES:
        log.warning(f"Invalid LEVQOR_LAUNCH_STAGE='{stage}', defaulting to '{_DEFAULT_STAGE}'")
        return _DEFAULT_STAGE
    
    return stage  # type: ignore


def is_post_launch() -> bool:
    """Check if we're in post-launch mode (live autonomous operations)."""
    return get_launch_stage() == "post"


def is_pre_launch() -> bool:
    """Check if we're in pre-launch mode (dry-run, proposals only)."""
    return get_launch_stage() == "pre"


def can_execute_autonomous_action(risk_level: str = "low") -> bool:
    """
    Determine if an autonomous action can be executed based on launch stage and risk.
    
    Args:
        risk_level: "low", "medium", or "high"
    
    Returns:
        True if the action can be executed, False if it should be dry-run/queued
    
    Behavior:
        - Pre-launch: All actions are dry-run (returns False)
        - Post-launch + low risk: Execute (returns True)
        - Post-launch + medium risk: Execute with logging (returns True)
        - Post-launch + high risk: Queue for approval (returns False)
    """
    stage = get_launch_stage()
    
    if stage == "pre":
        return False
    
    if risk_level == "high":
        return False
    
    return True


def get_stage_config() -> dict:
    """
    Get comprehensive stage configuration for status reporting.
    
    Returns:
        dict with stage info, permissions, and behavior flags
    """
    stage = get_launch_stage()
    
    return {
        "stage": stage,
        "is_live": stage == "post",
        "permissions": {
            "growth_organism_execute": stage == "post",
            "content_posting": stage == "post",
            "git_commits": stage == "post",
            "template_deployment": stage == "post",
            "high_risk_auto_approve": False,
        },
        "behavior": {
            "dry_run_default": stage == "pre",
            "require_approval_high_risk": True,
            "log_all_actions": True,
        },
        "env_var": "LEVQOR_LAUNCH_STAGE",
        "current_value": os.environ.get("LEVQOR_LAUNCH_STAGE", "(unset, defaulting to pre)"),
    }


def log_stage_info():
    """Log current launch stage configuration."""
    config = get_stage_config()
    stage = config["stage"]
    
    if stage == "pre":
        log.info(f"Launch Stage: PRE-LAUNCH (dry-run mode)")
        log.info("  - Growth organism: proposals only, no execution")
        log.info("  - Content posting: disabled")
        log.info("  - Git commits: disabled")
    else:
        log.info(f"Launch Stage: POST-LAUNCH (live autonomous mode)")
        log.info("  - Growth organism: low/medium risk actions enabled")
        log.info("  - Content posting: enabled (if API keys exist)")
        log.info("  - Git commits: enabled for passing CI")
        log.info("  - High-risk actions: still require approval")
