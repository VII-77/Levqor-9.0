"""
WOW-OS Brain Engine
Real-time AI OS engine for user state tracking and personalization
"""
import os
import time
import json
import uuid
from flask import Blueprint, request, jsonify

brain_bp = Blueprint("wow_brain", __name__, url_prefix="/api/wow/brain")


def get_db():
    from levqor.db import get_db as _get_db
    return _get_db()


def ensure_brain_table():
    db = get_db()
    db.execute("""
        CREATE TABLE IF NOT EXISTS user_brain_state (
            user_id TEXT PRIMARY KEY,
            email TEXT UNIQUE,
            updated_at REAL NOT NULL,
            json_state TEXT NOT NULL
        )
    """)
    db.commit()


def get_default_state():
    return {
        "version": 1,
        "onboarding_complete": False,
        "onboarding_step": 0,
        "first_workflow_created": False,
        "templates_viewed": [],
        "builder_sessions": 0,
        "ai_interactions": 0,
        "last_activity": None,
        "preferences": {
            "theme": "dark",
            "notifications": True,
            "ai_suggestions": True
        },
        "milestones": [],
        "events": []
    }


@brain_bp.route("/event", methods=["POST"])
def record_event():
    """Record a user action/event to the brain state"""
    data = request.get_json() or {}
    email = data.get("email")
    event_type = data.get("event_type")
    event_data = data.get("data", {})
    
    if not email:
        return jsonify({"ok": False, "error": "Email required"}), 400
    
    if not event_type:
        return jsonify({"ok": False, "error": "Event type required"}), 400
    
    ensure_brain_table()
    db = get_db()
    now = time.time()
    
    existing = db.execute(
        "SELECT * FROM user_brain_state WHERE email = ?", (email,)
    ).fetchone()
    
    if existing:
        state = json.loads(existing["json_state"])
    else:
        state = get_default_state()
    
    event = {
        "type": event_type,
        "data": event_data,
        "timestamp": now
    }
    
    if "events" not in state:
        state["events"] = []
    state["events"].append(event)
    state["events"] = state["events"][-100:]
    
    state["last_activity"] = now
    state["ai_interactions"] = state.get("ai_interactions", 0) + 1
    
    if event_type == "onboarding_step_complete":
        state["onboarding_step"] = max(
            state.get("onboarding_step", 0), 
            event_data.get("step", 0) + 1
        )
    elif event_type == "onboarding_complete":
        state["onboarding_complete"] = True
        if "onboarding" not in state.get("milestones", []):
            state.setdefault("milestones", []).append("onboarding")
    elif event_type == "workflow_created":
        state["first_workflow_created"] = True
        if "first_workflow" not in state.get("milestones", []):
            state.setdefault("milestones", []).append("first_workflow")
    elif event_type == "template_viewed":
        template_id = event_data.get("template_id")
        if template_id and template_id not in state.get("templates_viewed", []):
            state.setdefault("templates_viewed", []).append(template_id)
    elif event_type == "builder_session_start":
        state["builder_sessions"] = state.get("builder_sessions", 0) + 1
    
    json_state = json.dumps(state)
    
    if existing:
        db.execute(
            "UPDATE user_brain_state SET json_state = ?, updated_at = ? WHERE email = ?",
            (json_state, now, email)
        )
    else:
        user_id = str(uuid.uuid4())
        db.execute(
            "INSERT INTO user_brain_state (user_id, email, updated_at, json_state) VALUES (?, ?, ?, ?)",
            (user_id, email, now, json_state)
        )
    
    db.commit()
    
    return jsonify({
        "ok": True,
        "event_recorded": event_type,
        "state_version": state.get("version", 1)
    })


@brain_bp.route("/state", methods=["GET"])
def get_state():
    """Get current user brain state"""
    email = request.args.get("email")
    
    if not email:
        return jsonify({"ok": False, "error": "Email required"}), 400
    
    ensure_brain_table()
    db = get_db()
    
    existing = db.execute(
        "SELECT * FROM user_brain_state WHERE email = ?", (email,)
    ).fetchone()
    
    if existing:
        state = json.loads(existing["json_state"])
        return jsonify({
            "ok": True,
            "state": state,
            "updated_at": existing["updated_at"]
        })
    
    default = get_default_state()
    return jsonify({
        "ok": True,
        "state": default,
        "is_new": True
    })


@brain_bp.route("/recommendations", methods=["GET"])
def get_recommendations():
    """Get AI-powered recommendations based on user state"""
    email = request.args.get("email")
    
    if not email:
        return jsonify({"ok": False, "error": "Email required"}), 400
    
    ensure_brain_table()
    db = get_db()
    
    existing = db.execute(
        "SELECT * FROM user_brain_state WHERE email = ?", (email,)
    ).fetchone()
    
    if existing:
        state = json.loads(existing["json_state"])
    else:
        state = get_default_state()
    
    recommendations = []
    
    if not state.get("onboarding_complete"):
        recommendations.append({
            "id": "complete_onboarding",
            "title": "Complete Your Setup",
            "description": "Finish onboarding to unlock all features",
            "action": "/onboarding",
            "priority": 1,
            "type": "onboarding"
        })
    
    if not state.get("first_workflow_created"):
        recommendations.append({
            "id": "create_first_workflow",
            "title": "Create Your First Workflow",
            "description": "Use AI to generate a backup workflow in seconds",
            "action": "/builder",
            "priority": 2,
            "type": "builder"
        })
    
    if len(state.get("templates_viewed", [])) < 3:
        recommendations.append({
            "id": "explore_templates",
            "title": "Explore Templates",
            "description": "Browse 20+ ready-to-use workflow templates",
            "action": "/templates",
            "priority": 3,
            "type": "templates"
        })
    
    if state.get("builder_sessions", 0) == 0:
        recommendations.append({
            "id": "try_ai_builder",
            "title": "Try the AI Builder",
            "description": "Describe what you need and let AI create it",
            "action": "/builder",
            "priority": 4,
            "type": "builder"
        })
    
    return jsonify({
        "ok": True,
        "recommendations": recommendations,
        "state_summary": {
            "onboarding_complete": state.get("onboarding_complete", False),
            "workflows_created": state.get("first_workflow_created", False),
            "templates_explored": len(state.get("templates_viewed", [])),
            "ai_interactions": state.get("ai_interactions", 0)
        }
    })


@brain_bp.route("/reset", methods=["POST"])
def reset_state():
    """Reset user brain state (for testing)"""
    data = request.get_json() or {}
    email = data.get("email")
    
    if not email:
        return jsonify({"ok": False, "error": "Email required"}), 400
    
    ensure_brain_table()
    db = get_db()
    now = time.time()
    
    default = get_default_state()
    json_state = json.dumps(default)
    
    existing = db.execute(
        "SELECT * FROM user_brain_state WHERE email = ?", (email,)
    ).fetchone()
    
    if existing:
        db.execute(
            "UPDATE user_brain_state SET json_state = ?, updated_at = ? WHERE email = ?",
            (json_state, now, email)
        )
    else:
        user_id = str(uuid.uuid4())
        db.execute(
            "INSERT INTO user_brain_state (user_id, email, updated_at, json_state) VALUES (?, ?, ?, ?)",
            (user_id, email, now, json_state)
        )
    
    db.commit()
    
    return jsonify({
        "ok": True,
        "state": default
    })
