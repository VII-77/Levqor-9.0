"""
Templates API Routes - MEGA PHASE v20
REST endpoints for workflow template marketplace.
"""
from flask import jsonify, request
from . import templates_bp
from modules.growth_engine.templates import (
    get_starter_templates,
    get_template_by_id,
    get_categories,
    get_difficulty_levels,
    get_templates_summary
)


@templates_bp.route("", methods=["GET"])
@templates_bp.route("/", methods=["GET"])
def list_templates():
    """
    List all templates with optional filtering.
    
    Query params:
    - category: Filter by category ID
    - difficulty: Filter by difficulty level (beginner, intermediate, advanced)
    - tag: Filter by tag
    - search: Search in name, description, tags
    """
    category = request.args.get("category")
    difficulty = request.args.get("difficulty")
    tag = request.args.get("tag")
    search = request.args.get("search")
    
    templates = get_starter_templates(
        category=category,
        difficulty=difficulty,
        tag=tag,
        search=search
    )
    
    return jsonify({
        "success": True,
        "templates": templates,
        "count": len(templates),
        "filters": {
            "category": category,
            "difficulty": difficulty,
            "tag": tag,
            "search": search
        }
    })


@templates_bp.route("/<template_id>", methods=["GET"])
def get_template(template_id: str):
    """Get a single template by ID."""
    template = get_template_by_id(template_id)
    
    if not template:
        return jsonify({
            "success": False,
            "error": "Template not found"
        }), 404
    
    return jsonify({
        "success": True,
        "template": template
    })


@templates_bp.route("/categories", methods=["GET"])
def list_categories():
    """List all template categories."""
    categories = get_categories()
    
    return jsonify({
        "success": True,
        "categories": categories
    })


@templates_bp.route("/difficulties", methods=["GET"])
def list_difficulties():
    """List all difficulty levels."""
    levels = get_difficulty_levels()
    
    return jsonify({
        "success": True,
        "difficulties": levels
    })


@templates_bp.route("/summary", methods=["GET"])
def get_summary():
    """Get template marketplace summary statistics."""
    summary = get_templates_summary()
    
    return jsonify({
        "success": True,
        "summary": summary
    })
