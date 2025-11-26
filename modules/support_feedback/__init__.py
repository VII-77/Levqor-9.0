"""
Support Automation Feedback Module - V10 Completion
AI-powered suggestions from support tickets, feedback loops.
"""
import time
import logging
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from collections import Counter

log = logging.getLogger("levqor.support_feedback")


@dataclass
class FeedbackItem:
    id: str
    ticket_id: str
    category: str
    sentiment: str  # positive, negative, neutral
    keywords: List[str]
    suggestion: Optional[str] = None
    created_at: float = field(default_factory=time.time)
    processed: bool = False


_feedback_items: List[FeedbackItem] = []
_suggestion_patterns: Dict[str, List[str]] = {
    "timeout": ["Consider increasing timeout limits", "Add retry logic for long-running operations"],
    "connection": ["Check network configuration", "Verify firewall rules", "Add connection pooling"],
    "authentication": ["Review API key rotation", "Check token expiry settings", "Enable MFA"],
    "performance": ["Optimize database queries", "Add caching layer", "Review workflow complexity"],
    "integration": ["Check webhook endpoints", "Verify API versions", "Review rate limits"]
}


def analyze_ticket(ticket_id: str, subject: str, body: str) -> FeedbackItem:
    import uuid
    
    text = f"{subject} {body}".lower()
    
    if any(word in text for word in ["slow", "timeout", "performance", "latency"]):
        category = "performance"
    elif any(word in text for word in ["error", "fail", "broken", "bug"]):
        category = "error"
    elif any(word in text for word in ["auth", "login", "permission", "access"]):
        category = "authentication"
    elif any(word in text for word in ["connect", "network", "offline"]):
        category = "connection"
    elif any(word in text for word in ["feature", "request", "want", "need"]):
        category = "feature_request"
    else:
        category = "general"
    
    if any(word in text for word in ["hate", "terrible", "awful", "worst", "angry"]):
        sentiment = "negative"
    elif any(word in text for word in ["love", "great", "excellent", "amazing", "thank"]):
        sentiment = "positive"
    else:
        sentiment = "neutral"
    
    keywords = []
    for word in ["workflow", "api", "integration", "email", "webhook", "schedule", "trigger"]:
        if word in text:
            keywords.append(word)
    
    suggestions = _suggestion_patterns.get(category, [])
    suggestion = suggestions[0] if suggestions else None
    
    feedback = FeedbackItem(
        id=str(uuid.uuid4()),
        ticket_id=ticket_id,
        category=category,
        sentiment=sentiment,
        keywords=keywords,
        suggestion=suggestion
    )
    
    _feedback_items.append(feedback)
    
    log.info(f"Analyzed ticket {ticket_id}: category={category}, sentiment={sentiment}")
    
    return feedback


def get_feedback_summary() -> Dict[str, Any]:
    category_counts = Counter(f.category for f in _feedback_items)
    sentiment_counts = Counter(f.sentiment for f in _feedback_items)
    keyword_counts = Counter(k for f in _feedback_items for k in f.keywords)
    
    return {
        "total_feedback": len(_feedback_items),
        "by_category": dict(category_counts),
        "by_sentiment": dict(sentiment_counts),
        "top_keywords": keyword_counts.most_common(10),
        "negative_rate": sentiment_counts.get("negative", 0) / len(_feedback_items) if _feedback_items else 0
    }


def get_ai_suggestions() -> List[Dict[str, Any]]:
    category_counts = Counter(f.category for f in _feedback_items)
    
    suggestions = []
    
    for category, count in category_counts.most_common(5):
        if category in _suggestion_patterns:
            for suggestion in _suggestion_patterns[category]:
                suggestions.append({
                    "category": category,
                    "suggestion": suggestion,
                    "priority": "high" if count > 5 else "medium",
                    "ticket_count": count
                })
    
    return suggestions


def get_improvement_recommendations() -> List[Dict[str, Any]]:
    recommendations = []
    
    negative_items = [f for f in _feedback_items if f.sentiment == "negative"]
    if len(negative_items) > 5:
        recommendations.append({
            "type": "attention_required",
            "message": f"{len(negative_items)} tickets with negative sentiment detected",
            "action": "Review customer pain points",
            "priority": "high"
        })
    
    error_items = [f for f in _feedback_items if f.category == "error"]
    if len(error_items) > 3:
        recommendations.append({
            "type": "error_trend",
            "message": f"{len(error_items)} error-related tickets in recent period",
            "action": "Investigate common error patterns",
            "priority": "high"
        })
    
    feature_requests = [f for f in _feedback_items if f.category == "feature_request"]
    if feature_requests:
        recommendations.append({
            "type": "feature_insight",
            "message": f"{len(feature_requests)} feature requests collected",
            "action": "Consider roadmap prioritization",
            "priority": "medium"
        })
    
    return recommendations


def get_feedback_items(limit: int = 50) -> List[Dict[str, Any]]:
    items = sorted(_feedback_items, key=lambda x: x.created_at, reverse=True)[:limit]
    
    return [
        {
            "id": f.id,
            "ticket_id": f.ticket_id,
            "category": f.category,
            "sentiment": f.sentiment,
            "keywords": f.keywords,
            "suggestion": f.suggestion,
            "created_at": f.created_at
        }
        for f in items
    ]
