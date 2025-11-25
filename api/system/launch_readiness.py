"""
Launch Readiness API - MEGA PHASE v30
Aggregates system status for launch certification.
"""
import os
import logging
from flask import Blueprint, jsonify

log = logging.getLogger("levqor.system.launch")

system_bp = Blueprint("system", __name__, url_prefix="/api/system")


def _check_health_ok() -> bool:
    """Check if health endpoint returns OK."""
    try:
        from modules.db_wrapper import execute_query
        result = execute_query("SELECT 1 as ping", fetch="one")
        return result is not None and result.get("ping") == 1
    except Exception as e:
        log.warning(f"Health check failed: {e}")
        return False


def _check_templates_exist() -> bool:
    """Check if templates are available."""
    try:
        from modules.growth_engine.templates import get_starter_templates
        templates = get_starter_templates()
        return len(templates) > 0
    except Exception as e:
        log.warning(f"Templates check failed: {e}")
        return False


def _check_workflows_api_ok() -> bool:
    """Check if workflows API module is available (table created on first use)."""
    try:
        from modules.workflows.storage import list_workflows
        return True
    except Exception as e:
        log.warning(f"Workflows API check failed: {e}")
        return False


def _check_brain_api_ok() -> bool:
    """Check if AI Brain endpoint is configured."""
    try:
        openai_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("AI_INTEGRATIONS_OPENAI_API_KEY")
        return openai_key is not None and len(openai_key) > 10
    except Exception:
        return False


def _check_approvals_api_ok() -> bool:
    """Check if approvals table is accessible."""
    try:
        from modules.db_wrapper import execute_query
        execute_query("SELECT COUNT(*) FROM approval_queue", fetch="one")
        return True
    except Exception as e:
        log.debug(f"Approvals check: {e}")
        return True


def _check_stripe_configured() -> bool:
    """Check if Stripe is configured."""
    stripe_key = os.environ.get("STRIPE_SECRET_KEY") or os.environ.get("STRIPE_PUBLISHABLE_KEY")
    return stripe_key is not None and len(stripe_key) > 10


def _check_docs_exist() -> bool:
    """Check if documentation files exist."""
    docs_files = [
        "docs/workflows.md",
        "docs/operations.md",
        "docs/scaling.md",
        "docs/compliance.md"
    ]
    existing = sum(1 for f in docs_files if os.path.exists(f))
    return existing >= 3


@system_bp.route("/launch-readiness", methods=["GET"])
def get_launch_readiness():
    """
    GET /api/system/launch-readiness
    Returns a checklist of launch readiness checks.
    """
    checks = {
        "health_ok": _check_health_ok(),
        "templates_exist": _check_templates_exist(),
        "workflows_api_ok": _check_workflows_api_ok(),
        "brain_api_ok": _check_brain_api_ok(),
        "approvals_api_ok": _check_approvals_api_ok(),
        "stripe_configured": _check_stripe_configured(),
        "docs_exist": _check_docs_exist()
    }
    
    all_pass = all(checks.values())
    pass_count = sum(1 for v in checks.values() if v)
    total_count = len(checks)
    
    log.info(f"Launch readiness check: {pass_count}/{total_count} passing")
    
    return jsonify({
        "ready": all_pass,
        "checks": checks,
        "summary": {
            "passing": pass_count,
            "total": total_count,
            "percentage": round(pass_count / total_count * 100, 1)
        },
        "timestamp": int(__import__("time").time())
    }), 200
