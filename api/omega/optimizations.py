"""
Omega Optimizations API - MEGA-PHASE Ω LAYER 3
Read-only API endpoint for Omega Optimizations
"""
from flask import Blueprint, jsonify
import json
from pathlib import Path
import logging

bp = Blueprint("omega_optimizations", __name__, url_prefix="/api/omega")
log = logging.getLogger("levqor.api.omega.optimizations")

OPTIMIZATIONS_FILE = Path("workspace-data/omega_optimizations.json")


@bp.get("/optimizations")
def get_omega_optimizations():
    """
    Get current Omega Optimization recommendations
    
    Returns:
        JSON with optimizations list, priority breakdown, and metadata
    """
    try:
        if not OPTIMIZATIONS_FILE.exists():
            return jsonify({
                "status": "ok",
                "optimizations": [],
                "generated_at": None,
                "optimization_count": 0,
                "by_priority": {},
                "note": "No optimizations file yet - Omega Optimizer hasn't run"
            }), 200
        
        # Read with robust error handling
        with OPTIMIZATIONS_FILE.open("r") as f:
            content = f.read()
            if not content.strip():
                # Empty file
                return jsonify({
                    "status": "ok",
                    "optimizations": [],
                    "generated_at": None,
                    "optimization_count": 0,
                    "by_priority": {},
                    "note": "Optimizations file is empty"
                }), 200
            
            data = json.loads(content)
        
        # Validate data structure with safe defaults
        optimizations = data.get("optimizations", [])
        if not isinstance(optimizations, list):
            optimizations = []
        
        by_priority = data.get("by_priority", {})
        if not isinstance(by_priority, dict):
            by_priority = {}
        
        return jsonify({
            "status": "ok",
            "optimizations": optimizations,
            "generated_at": data.get("generated_at"),
            "optimization_count": len(optimizations),
            "by_priority": by_priority
        }), 200
        
    except json.JSONDecodeError as e:
        log.error(f"Invalid JSON in omega optimizations file: {e}")
        return jsonify({
            "status": "ok",
            "optimizations": [],
            "generated_at": None,
            "optimization_count": 0,
            "by_priority": {},
            "note": "Optimizations file contains invalid JSON - returning empty"
        }), 200
    except Exception as e:
        log.error(f"Error reading omega optimizations: {e}")
        return jsonify({
            "status": "error",
            "error": str(e),
            "optimizations": [],
            "generated_at": None,
            "optimization_count": 0,
            "by_priority": {}
        }), 500
