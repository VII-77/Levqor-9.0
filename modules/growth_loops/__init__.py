"""
Growth Loops Module - V10 Completion
Sharing, copy-to-template, referrals, viral mechanics.
"""
import time
import logging
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
import uuid

log = logging.getLogger("levqor.growth_loops")


@dataclass
class ShareEvent:
    id: str
    workflow_id: str
    shared_by: str
    share_type: str  # link, email, social
    created_at: float = field(default_factory=time.time)
    clicks: int = 0
    conversions: int = 0


@dataclass
class TemplateCopy:
    id: str
    source_workflow_id: str
    source_owner: str
    copied_by: str
    template_name: str
    created_at: float = field(default_factory=time.time)


_share_events: List[ShareEvent] = []
_template_copies: List[TemplateCopy] = []


def create_share_link(workflow_id: str, user_id: str, share_type: str = "link") -> Dict[str, Any]:
    event = ShareEvent(
        id=str(uuid.uuid4()),
        workflow_id=workflow_id,
        shared_by=user_id,
        share_type=share_type
    )
    
    _share_events.append(event)
    
    share_url = f"https://levqor.ai/shared/{event.id}"
    
    log.info(f"Share link created: {event.id} for workflow {workflow_id}")
    
    return {
        "success": True,
        "share_id": event.id,
        "share_url": share_url,
        "share_type": share_type
    }


def record_share_click(share_id: str) -> Dict[str, Any]:
    for event in _share_events:
        if event.id == share_id:
            event.clicks += 1
            return {"success": True, "clicks": event.clicks}
    
    return {"success": False, "error": "Share not found"}


def record_share_conversion(share_id: str) -> Dict[str, Any]:
    for event in _share_events:
        if event.id == share_id:
            event.conversions += 1
            return {"success": True, "conversions": event.conversions}
    
    return {"success": False, "error": "Share not found"}


def copy_as_template(
    workflow_id: str,
    source_owner: str,
    copied_by: str,
    template_name: str
) -> Dict[str, Any]:
    copy = TemplateCopy(
        id=str(uuid.uuid4()),
        source_workflow_id=workflow_id,
        source_owner=source_owner,
        copied_by=copied_by,
        template_name=template_name
    )
    
    _template_copies.append(copy)
    
    log.info(f"Workflow {workflow_id} copied as template by {copied_by}")
    
    return {
        "success": True,
        "copy_id": copy.id,
        "template_name": template_name,
        "source_workflow_id": workflow_id
    }


def get_share_stats(user_id: Optional[str] = None) -> Dict[str, Any]:
    events = _share_events
    if user_id:
        events = [e for e in events if e.shared_by == user_id]
    
    total_shares = len(events)
    total_clicks = sum(e.clicks for e in events)
    total_conversions = sum(e.conversions for e in events)
    
    by_type = {}
    for e in events:
        if e.share_type not in by_type:
            by_type[e.share_type] = {"shares": 0, "clicks": 0, "conversions": 0}
        by_type[e.share_type]["shares"] += 1
        by_type[e.share_type]["clicks"] += e.clicks
        by_type[e.share_type]["conversions"] += e.conversions
    
    return {
        "total_shares": total_shares,
        "total_clicks": total_clicks,
        "total_conversions": total_conversions,
        "conversion_rate": (total_conversions / total_clicks * 100) if total_clicks > 0 else 0,
        "by_type": by_type
    }


def get_template_copy_stats() -> Dict[str, Any]:
    return {
        "total_copies": len(_template_copies),
        "unique_workflows_copied": len(set(c.source_workflow_id for c in _template_copies)),
        "unique_users_copying": len(set(c.copied_by for c in _template_copies)),
        "recent_copies": [
            {
                "id": c.id,
                "template_name": c.template_name,
                "created_at": c.created_at
            }
            for c in sorted(_template_copies, key=lambda x: x.created_at, reverse=True)[:10]
        ]
    }


def get_viral_coefficient() -> Dict[str, Any]:
    if not _share_events:
        return {"viral_coefficient": 0, "status": "no_data"}
    
    total_users = len(set(e.shared_by for e in _share_events))
    total_conversions = sum(e.conversions for e in _share_events)
    
    k_factor = total_conversions / total_users if total_users > 0 else 0
    
    return {
        "viral_coefficient": round(k_factor, 2),
        "total_sharers": total_users,
        "total_conversions": total_conversions,
        "status": "viral" if k_factor >= 1 else ("growing" if k_factor >= 0.5 else "stable")
    }


def get_growth_leaderboard(limit: int = 10) -> List[Dict[str, Any]]:
    user_stats = {}
    
    for event in _share_events:
        if event.shared_by not in user_stats:
            user_stats[event.shared_by] = {"shares": 0, "clicks": 0, "conversions": 0, "points": 0}
        
        user_stats[event.shared_by]["shares"] += 1
        user_stats[event.shared_by]["clicks"] += event.clicks
        user_stats[event.shared_by]["conversions"] += event.conversions
        user_stats[event.shared_by]["points"] += (event.clicks * 1) + (event.conversions * 10)
    
    for copy in _template_copies:
        if copy.source_owner not in user_stats:
            user_stats[copy.source_owner] = {"shares": 0, "clicks": 0, "conversions": 0, "points": 0}
        user_stats[copy.source_owner]["points"] += 5
    
    sorted_users = sorted(user_stats.items(), key=lambda x: x[1]["points"], reverse=True)[:limit]
    
    return [
        {
            "rank": i + 1,
            "user_id": user_id,
            "stats": stats
        }
        for i, (user_id, stats) in enumerate(sorted_users)
    ]
