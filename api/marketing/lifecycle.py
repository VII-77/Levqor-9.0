"""
Lifecycle Nudge Engine - MEGA-PHASE 5
Tracks user journey and triggers day-based marketing nudges
"""
from flask import Blueprint, request, jsonify
import logging
import json
from datetime import datetime, timedelta
from pathlib import Path

bp = Blueprint("lifecycle", __name__, url_prefix="/api/marketing/lifecycle")
log = logging.getLogger("levqor.marketing.lifecycle")

LIFECYCLE_FILE = Path("workspace-data/lifecycle.json")


@bp.post("/tick")
def lifecycle_tick():
    """
    Lifecycle engine tick - called daily by scheduler
    
    Identifies users at key journey milestones:
    - Day 1: Quick-start checklist
    - Day 3: Workflow suggestions
    - Day 6: Upgrade benefits
    - Day 7: Trial ending CTA
    - Day 10: DFY upsell
    - Day 30: ROI summary
    
    Response: {
        "success": boolean,
        "users_processed": number,
        "day_buckets": object
    }
    """
    from api.metrics.app import increment_lifecycle_tick
    
    increment_lifecycle_tick()
    
    try:
        # In production, this would query database for user signup dates
        # For demo/testing, generate sample lifecycle data based on current time
        
        day_buckets = {
            "day_1": 0,
            "day_3": 0,
            "day_6": 0,
            "day_7": 0,
            "day_10": 0,
            "day_30": 0
        }
        
        lifecycle_events = []
        
        # Generate sample lifecycle events for demonstration
        # In production, replace with actual database query:
        # SELECT user_id, created_at FROM users WHERE 
        # DATE_PART('day', NOW() - created_at) IN (1, 3, 6, 7, 10, 30)
        
        current_time = datetime.utcnow()
        
        # Simulate users at different lifecycle stages
        sample_users = [
            {"user_id": "user_001", "days_since_signup": 1, "tier": "trial"},
            {"user_id": "user_002", "days_since_signup": 1, "tier": "trial"},
            {"user_id": "user_003", "days_since_signup": 3, "tier": "trial"},
            {"user_id": "user_004", "days_since_signup": 6, "tier": "trial"},
            {"user_id": "user_005", "days_since_signup": 7, "tier": "trial"},
            {"user_id": "user_006", "days_since_signup": 7, "tier": "trial"},
            {"user_id": "user_007", "days_since_signup": 10, "tier": "starter"},
            {"user_id": "user_008", "days_since_signup": 30, "tier": "growth"}
        ]
        
        for user in sample_users:
            days = user["days_since_signup"]
            
            # Map to lifecycle day buckets
            if days == 1:
                day_buckets["day_1"] += 1
                banner_type = "quick_start"
            elif days == 3:
                day_buckets["day_3"] += 1
                banner_type = "workflow_suggestions"
            elif days == 6:
                day_buckets["day_6"] += 1
                banner_type = "upgrade_benefits"
            elif days == 7:
                day_buckets["day_7"] += 1
                banner_type = "trial_ending"
            elif days == 10:
                day_buckets["day_10"] += 1
                banner_type = "dfy_upsell"
            elif days == 30:
                day_buckets["day_30"] += 1
                banner_type = "roi_summary"
            else:
                continue
            
            # Create lifecycle event
            event = {
                "user_id": user["user_id"],
                "lifecycle_day": days,
                "banner_type": banner_type,
                "tier": user["tier"],
                "created_at": current_time.isoformat()
            }
            lifecycle_events.append(event)
        
        log.info(f"Lifecycle tick executed: buckets={day_buckets}, events={len(lifecycle_events)}")
        
        # Store lifecycle events
        _save_lifecycle_events(lifecycle_events)
        
        return jsonify({
            "success": True,
            "users_processed": sum(day_buckets.values()),
            "day_buckets": day_buckets,
            "events_generated": len(lifecycle_events),
            "meta": {
                "execution_time": current_time.isoformat(),
                "sample_data": True  # Indicates this is sample data for demo
            }
        }), 200
        
    except Exception as e:
        log.error(f"Lifecycle tick error: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500


@bp.get("/user/<user_id>/current_day")
def get_user_lifecycle_day(user_id: str):
    """
    Get current lifecycle day for a user
    Used by frontend to show appropriate nudge banner
    
    Response: {
        "success": boolean,
        "lifecycle_day": number,
        "banner_type": string
    }
    """
    try:
        # In production, calculate from user's created_at timestamp
        # For demo, return mock data
        
        lifecycle_day = 7  # Example: user on day 7 (trial ending)
        
        # Map day to banner type
        banner_map = {
            1: "quick_start",
            3: "workflow_suggestions",
            6: "upgrade_benefits",
            7: "trial_ending",
            10: "dfy_upsell",
            30: "roi_summary"
        }
        
        banner_type = banner_map.get(lifecycle_day, "none")
        
        return jsonify({
            "success": True,
            "lifecycle_day": lifecycle_day,
            "banner_type": banner_type
        }), 200
        
    except Exception as e:
        log.error(f"Get lifecycle day error: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500


def _save_lifecycle_events(events: list):
    """Save lifecycle events to JSON file"""
    try:
        if LIFECYCLE_FILE.exists():
            with open(LIFECYCLE_FILE, 'r') as f:
                all_events = json.load(f)
        else:
            all_events = []
        
        all_events.extend(events)
        
        # Keep only last 1000 events
        all_events = all_events[-1000:]
        
        with open(LIFECYCLE_FILE, 'w') as f:
            json.dump(all_events, f, indent=2)
    
    except Exception as e:
        log.error(f"Error saving lifecycle events: {e}")
