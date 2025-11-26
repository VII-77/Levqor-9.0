"""
Workflow Validator API Blueprint - V10 Completion
REST endpoints for workflow validation and linting.
"""
from flask import Blueprint, jsonify, request
import logging

from modules.workflow_validator import (
    validate_workflow,
    lint_workflow,
    VALID_STEP_TYPES
)

log = logging.getLogger("levqor.api.validator")

validator_bp = Blueprint("validator", __name__, url_prefix="/api/validator")


@validator_bp.route("/validate", methods=["POST"])
def validate():
    """POST /api/validator/validate - Validate a workflow definition."""
    try:
        data = request.get_json() or {}
        
        workflow = data.get("workflow", data)
        
        result = validate_workflow(workflow)
        
        status_code = 200 if result.valid else 422
        return jsonify({
            "success": result.valid,
            **result.to_dict()
        }), status_code
    except Exception as e:
        log.error(f"Error validating workflow: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@validator_bp.route("/lint", methods=["POST"])
def lint():
    """POST /api/validator/lint - Lint a workflow and get suggestions."""
    try:
        data = request.get_json() or {}
        
        workflow = data.get("workflow", data)
        
        result = lint_workflow(workflow)
        
        return jsonify({
            "success": True,
            **result
        }), 200
    except Exception as e:
        log.error(f"Error linting workflow: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@validator_bp.route("/step-types", methods=["GET"])
def step_types():
    """GET /api/validator/step-types - Get valid step types."""
    try:
        return jsonify({
            "success": True,
            "step_types": VALID_STEP_TYPES,
            "count": len(VALID_STEP_TYPES)
        }), 200
    except Exception as e:
        log.error(f"Error getting step types: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
