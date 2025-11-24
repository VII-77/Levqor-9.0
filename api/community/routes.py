"""Community Routes - Workflow Submissions, Badges, Stats - HYPERGROWTH CYCLE 5"""

from flask import jsonify, request
from . import community_bp
import logging
import os
import json
from datetime import datetime
import tempfile

log = logging.getLogger(__name__)

# Badge definitions
BADGES = [
    {"id": "badge-001", "name": "First Workflow", "icon": "🎯", "description": "Created your first workflow", "rarity": "Common", "requirement": "Create 1 workflow"},
    {"id": "badge-002", "name": "10 Workflows", "icon": "⚡", "description": "Built 10 workflows", "rarity": "Common", "requirement": "Create 10 workflows"},
    {"id": "badge-003", "name": "Automation Master", "icon": "🏆", "description": "Completed 100 workflows", "rarity": "Legendary", "requirement": "Create 100 workflows"},
    {"id": "badge-004", "name": "Early Adopter", "icon": "🚀", "description": "Joined in the first month", "rarity": "Epic", "requirement": "Sign up in November 2025"},
    {"id": "badge-005", "name": "Community Helper", "icon": "💬", "description": "Helped 10+ community members", "rarity": "Rare", "requirement": "10 helpful answers"},
    {"id": "badge-006", "name": "Template Creator", "icon": "📝", "description": "Shared 5 workflow templates", "rarity": "Rare", "requirement": "Submit 5 templates"},
    {"id": "badge-007", "name": "Bug Hunter", "icon": "🐛", "description": "Reported 3 valid bugs", "rarity": "Epic", "requirement": "Report 3 bugs"},
    {"id": "badge-008", "name": "AI Pioneer", "icon": "🤖", "description": "Used AI workflow builder 50 times", "rarity": "Epic", "requirement": "50 AI-generated workflows"},
]

# Community workflow submissions (stub data - will grow with real submissions)
COMMUNITY_WORKFLOWS = [
    {"id": "comm-001", "title": "Customer Onboarding Workflow", "author": "Sarah K.", "category": "Support", "difficulty": "Intermediate", "upvotes": 45, "timestamp": "2024-11-20T10:30:00Z"},
    {"id": "comm-002", "title": "Automated Invoice Generation", "author": "Mike R.", "category": "Finance", "difficulty": "Advanced", "upvotes": 38, "timestamp": "2024-11-21T14:22:00Z"},
    {"id": "comm-003", "title": "Social Media Cross-Poster", "author": "Alex T.", "category": "Marketing", "difficulty": "Beginner", "upvotes": 67, "timestamp": "2024-11-22T09:15:00Z"},
    {"id": "comm-004", "title": "Lead Qualification System", "author": "Emma L.", "category": "Sales", "difficulty": "Advanced", "upvotes": 52, "timestamp": "2024-11-23T16:45:00Z"},
    {"id": "comm-005", "title": "Team Standup Automation", "author": "David M.", "category": "Productivity", "difficulty": "Beginner", "upvotes": 29, "timestamp": "2024-11-24T08:00:00Z"},
]

# Discussion topics (stub data)
DISCUSSIONS = [
    {"id": 1, "title": "How to automate complex multi-step approval flows?", "author": "Sarah K.", "replies": 12, "likes": 24, "category": "Q&A", "timestamp": "2 hours ago"},
    {"id": 2, "title": "Sharing my customer onboarding workflow template", "author": "Mike R.", "replies": 8, "likes": 45, "category": "Templates", "timestamp": "5 hours ago"},
    {"id": 3, "title": "Best practices for error handling in production workflows", "author": "Alex T.", "replies": 15, "likes": 38, "category": "Best Practices", "timestamp": "1 day ago"},
    {"id": 4, "title": "Feature Request: Stripe to QuickBooks integration", "author": "Emma L.", "replies": 6, "likes": 19, "category": "Feature Requests", "timestamp": "1 day ago"},
    {"id": 5, "title": "How I automated our entire sales pipeline (case study)", "author": "David M.", "replies": 23, "likes": 67, "category": "Success Stories", "timestamp": "2 days ago"},
]


@community_bp.route('/list', methods=['GET'])
def get_community_workflows():
    """
    Get list of community-submitted workflows.
    Query params: category, difficulty, limit, language
    """
    try:
        category = request.args.get('category', '').strip()
        difficulty = request.args.get('difficulty', '').strip()
        limit = int(request.args.get('limit', 50))
        language = request.args.get('language', 'en')
        
        # Filter workflows
        filtered = COMMUNITY_WORKFLOWS
        
        if category and category.lower() != 'all':
            filtered = [w for w in filtered if w['category'].lower() == category.lower()]
        
        if difficulty and difficulty.lower() != 'all':
            filtered = [w for w in filtered if w['difficulty'].lower() == difficulty.lower()]
        
        filtered = filtered[:limit]
        
        log.info(f"Community workflows: {len(filtered)} results (language={language})")
        
        return jsonify({
            "workflows": filtered,
            "discussions": DISCUSSIONS,
            "total": len(filtered),
            "language": language
        }), 200
        
    except Exception as e:
        log.error(f"Error in community list: {e}")
        return jsonify({"error": "Failed to load community workflows"}), 500


@community_bp.route('/badges', methods=['GET'])
def get_badges():
    """Get all available badges and achievement definitions."""
    try:
        language = request.args.get('language', 'en')
        
        log.info(f"Badges: {len(BADGES)} badges (language={language})")
        
        return jsonify({
            "badges": BADGES,
            "total": len(BADGES),
            "language": language
        }), 200
        
    except Exception as e:
        log.error(f"Error in badges: {e}")
        return jsonify({"error": "Failed to load badges"}), 500


@community_bp.route('/stats', methods=['GET'])
def get_community_stats():
    """Get community statistics and leaderboard data."""
    try:
        language = request.args.get('language', 'en')
        
        stats = {
            "activeMembers": 2547,
            "sharedWorkflows": 843,
            "discussions": 1239,
            "countries": 156,
            "topContributors": [
                {"name": "Sarah K.", "workflows": 23, "upvotes": 456},
                {"name": "Mike R.", "workflows": 18, "upvotes": 389},
                {"name": "Alex T.", "workflows": 15, "upvotes": 312},
                {"name": "Emma L.", "workflows": 12, "upvotes": 287},
                {"name": "David M.", "workflows": 11, "upvotes": 245}
            ],
            "language": language
        }
        
        log.info(f"Community stats: {stats['activeMembers']} members (language={language})")
        
        return jsonify(stats), 200
        
    except Exception as e:
        log.error(f"Error in community stats: {e}")
        return jsonify({"error": "Failed to load stats"}), 500


@community_bp.route('/submit', methods=['POST'])
def submit_workflow():
    """
    Submit a new workflow to the community.
    Expects JSON: {title, description, category, difficulty, language, tags (optional)}
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required = ['title', 'description', 'category', 'difficulty']
        missing = [f for f in required if not data.get(f)]
        
        if missing:
            return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400
        
        # Extract data
        submission = {
            "title": data['title'].strip(),
            "description": data['description'].strip(),
            "category": data['category'].strip(),
            "difficulty": data['difficulty'].strip(),
            "language": data.get('language', 'en'),
            "tags": data.get('tags', []),
            "timestamp": datetime.utcnow().isoformat() + 'Z',
            "status": "pending_review"
        }
        
        # Log submission (stub mode - in production, save to DB)
        log_dir = "data/community_submissions"
        os.makedirs(log_dir, exist_ok=True)
        
        submission_file = os.path.join(log_dir, "submissions.jsonl")
        
        # Atomic write pattern (Omega standard)
        temp_fd, temp_path = tempfile.mkstemp(dir=log_dir, suffix=".tmp")
        try:
            with os.fdopen(temp_fd, 'a') as f:
                f.write(json.dumps(submission) + '\n')
            os.rename(temp_path, submission_file)
        except Exception as write_error:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            raise write_error
        
        log.info(f"Community submission: {submission['title']} (category={submission['category']}, language={submission['language']})")
        
        return jsonify({
            "success": True,
            "message": "Workflow submitted successfully! It will be reviewed by our team.",
            "submission": submission
        }), 201
        
    except Exception as e:
        log.error(f"Error in workflow submission: {e}")
        return jsonify({"error": "Failed to submit workflow. Please try again."}), 500
