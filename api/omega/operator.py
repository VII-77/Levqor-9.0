"""
Omega Operator API - MEGA-PHASE Ω LAYER 2
Read-only API endpoint for Omega Tasks
"""
from flask import Blueprint, jsonify
import json
from pathlib import Path
import logging

bp = Blueprint("omega_operator", __name__, url_prefix="/api/omega")
log = logging.getLogger("levqor.api.omega")

TASKS_FILE = Path("workspace-data/omega_tasks.json")


@bp.get("/tasks")
def get_omega_tasks():
    """
    Get current Omega Operator tasks
    
    Returns:
        JSON with tasks list, generated timestamp, and status
    """
    try:
        if not TASKS_FILE.exists():
            return jsonify({
                "status": "ok",
                "tasks": [],
                "generated_at": None,
                "task_count": 0,
                "note": "No tasks file yet - Omega Operator hasn't run"
            }), 200
        
        # Read with robust error handling
        with TASKS_FILE.open("r") as f:
            content = f.read()
            if not content.strip():
                # Empty file
                return jsonify({
                    "status": "ok",
                    "tasks": [],
                    "generated_at": None,
                    "task_count": 0,
                    "note": "Tasks file is empty"
                }), 200
            
            data = json.loads(content)
        
        # Validate data structure with safe defaults
        tasks = data.get("tasks", [])
        if not isinstance(tasks, list):
            tasks = []
        
        return jsonify({
            "status": "ok",
            "tasks": tasks,
            "generated_at": data.get("generated_at"),
            "task_count": len(tasks)
        }), 200
        
    except json.JSONDecodeError as e:
        log.error(f"Invalid JSON in omega tasks file: {e}")
        return jsonify({
            "status": "ok",
            "tasks": [],
            "generated_at": None,
            "task_count": 0,
            "note": "Tasks file contains invalid JSON - returning empty"
        }), 200
    except Exception as e:
        log.error(f"Error reading omega tasks: {e}")
        return jsonify({
            "status": "error",
            "error": str(e),
            "tasks": [],
            "generated_at": None,
            "task_count": 0
        }), 500
