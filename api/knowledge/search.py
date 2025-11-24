"""
Knowledge Base Search Endpoint
MEGA-PHASE 6 - Simple KB search with no external dependencies
"""
from flask import Blueprint, request, jsonify
import logging
from api.knowledge.data import search_articles

bp = Blueprint("knowledge", __name__, url_prefix="/api/knowledge")
log = logging.getLogger("levqor.knowledge")


@bp.get("/search")
def knowledge_search():
    """
    Search knowledge base articles.
    
    Query params:
        q: search query (required)
        category: optional category filter
    
    Response: { "success": bool, "results": array }
    """
    query = request.args.get("q", "").strip()
    category = request.args.get("category", "").strip() or None
    
    if not query:
        return jsonify({
            "success": False,
            "error": "Missing required parameter: q"
        }), 400
    
    if len(query) < 2:
        return jsonify({
            "success": False,
            "error": "Query must be at least 2 characters"
        }), 422
    
    log.info(f"KB search: query='{query[:50]}', category={category}")
    
    results = search_articles(query, category)
    
    # Add snippet (first 160 chars of body)
    for article in results:
        article["snippet"] = article["body"][:160] + ("..." if len(article["body"]) > 160 else "")
    
    return jsonify({
        "success": True,
        "results": results,
        "total": len(results)
    }), 200


@bp.get("/categories")
def get_categories():
    """
    Get list of all KB categories.
    
    Response: { "success": bool, "categories": array }
    """
    from api.knowledge.data import KNOWLEDGE_BASE
    
    categories = list(set(article["category"] for article in KNOWLEDGE_BASE))
    categories.sort()
    
    return jsonify({
        "success": True,
        "categories": categories
    }), 200
