"""
Omega Optimization Engine - MEGA-PHASE Ω LAYER 3
Analyzes metrics and generates performance/cost/quality optimizations
SAFE: Read-only analysis, recommendations only
"""
import logging
import json
from datetime import datetime
from pathlib import Path

log = logging.getLogger("levqor.omega.optimizer")

# Use workspace-data for outputs
OPTIMIZATIONS_FILE = Path("workspace-data/omega_optimizations.json")
OPTIMIZATIONS_LOG = Path("workspace-data/omega_optimizations.log")


def get_current_metrics():
    """Get current metrics via internal call (with app context)"""
    try:
        from run import app
        with app.app_context():
            with app.test_client() as client:
                response = client.get('/api/metrics/app')
                if response.status_code == 200:
                    return response.get_json()
        log.warning("Metrics endpoint returned non-200 status")
        return None
    except Exception as e:
        log.error(f"Error getting metrics: {e}")
        return None


def analyze_ai_performance(metrics):
    """Generate AI performance optimizations"""
    optimizations = []
    
    if not metrics:
        return optimizations
    
    ai_requests = metrics.get("ai_requests_total", 0)
    ai_errors = metrics.get("ai_errors_total", 0)
    openai_calls = metrics.get("ai_openai_calls_total", 0)
    
    # Recommendation: Enable AI if zero OpenAI calls
    if ai_requests > 0 and openai_calls == 0:
        optimizations.append({
            "id": f"ai_enable_openai_{datetime.utcnow().strftime('%Y%m%d')}",
            "category": "ai_quality",
            "priority": "high",
            "type": "enhancement",
            "title": "Enable OpenAI for real AI responses",
            "description": f"AI endpoints are receiving requests ({ai_requests} total) but using pattern-based fallbacks. Enable OpenAI for better user experience.",
            "benefit": "Higher quality AI responses, better engagement, reduced escalation rate",
            "implementation": "Set AI_ENABLED=true and OPENAI_API_KEY in secrets. GPT-4o-mini has strict cost controls (256 tokens max, 10s timeout).",
            "estimated_impact": {
                "quality_improvement": "high",
                "cost_increase": "low ($0.15-0.60 per 1000 requests)",
                "user_satisfaction": "+30-50%"
            }
        })
    
    # High error rate optimization
    if ai_requests > 10:
        error_rate = ai_errors / ai_requests
        if error_rate > 0.05:
            optimizations.append({
                "id": f"ai_reduce_errors_{datetime.utcnow().strftime('%Y%m%d')}",
                "category": "ai_reliability",
                "priority": "critical",
                "type": "fix",
                "title": "Reduce AI error rate",
                "description": f"AI error rate is {error_rate:.1%}. Target: <5%",
                "benefit": "Improved reliability, better user experience",
                "implementation": "Inspect /api/ai/* logs. Common causes: invalid API key, rate limits, timeout issues. Check OpenAI dashboard for quota.",
                "estimated_impact": {
                    "error_reduction": f"{error_rate:.1%} → <5%",
                    "user_satisfaction": "+20%"
                }
            })
    
    return optimizations


def analyze_gtm_conversion(metrics):
    """Generate GTM/conversion optimizations"""
    optimizations = []
    
    if not metrics or "business_metrics" not in metrics:
        return optimizations
    
    biz = metrics["business_metrics"]
    consultations = biz.get("consultations_booked", 0)
    pricing_cta = biz.get("pricing_cta_clicks", 0)
    trial_feedback = biz.get("trial_feedback_submissions", 0)
    
    # Consultation conversion funnel
    if pricing_cta > 10 and consultations == 0:
        optimizations.append({
            "id": f"gtm_consultation_funnel_{datetime.utcnow().strftime('%Y%m%d')}",
            "category": "conversion",
            "priority": "high",
            "type": "optimization",
            "title": "Improve consultation booking funnel",
            "description": f"{pricing_cta} pricing CTA clicks but 0 consultations booked. Conversion gap identified.",
            "benefit": "Higher consultation booking rate, more DFY revenue",
            "implementation": "1) Reduce consultation form fields to 3 max (name, email, service). 2) Add social proof near CTA ('100+ consultations booked'). 3) Test urgency copy ('Book your free consultation - 5 slots left this week').",
            "estimated_impact": {
                "conversion_lift": "+15-25%",
                "consultations_per_100_visitors": "2-4",
                "dfy_revenue_increase": "+£3,000-5,000/month"
            }
        })
    
    # Trial feedback loop
    if trial_feedback == 0:
        optimizations.append({
            "id": f"gtm_trial_feedback_{datetime.utcnow().strftime('%Y%m%d')}",
            "category": "retention",
            "priority": "medium",
            "type": "enhancement",
            "title": "Activate trial feedback loop",
            "description": "Zero trial feedback submissions. Missing critical retention signal.",
            "benefit": "Early churn detection, personalized intervention, higher trial→paid conversion",
            "implementation": "Add exit-intent survey on trial cancellation. Email on day 5 of trial: 'How's it going? Quick feedback?' Offer support escalation for negative feedback.",
            "estimated_impact": {
                "retention_lift": "+10-15%",
                "trial_to_paid_conversion": "20% → 25%",
                "mrr_increase": "+£400-600/month"
            }
        })
    
    return optimizations


def analyze_cost_efficiency(metrics):
    """Generate cost optimization recommendations"""
    optimizations = []
    
    if not metrics:
        return optimizations
    
    openai_calls_5m = metrics.get("ai_openai_calls_last_5m", 0)
    openai_errors_5m = metrics.get("ai_openai_errors_last_5m", 0)
    
    # High OpenAI error rate = wasted API costs
    if openai_calls_5m > 0:
        error_rate = openai_errors_5m / openai_calls_5m
        if error_rate > 0.1:
            monthly_waste = openai_calls_5m * 12 * 24 * 30 * 0.0003  # Rough estimate
            optimizations.append({
                "id": f"cost_openai_errors_{datetime.utcnow().strftime('%Y%m%d')}",
                "category": "cost",
                "priority": "high",
                "type": "optimization",
                "title": "Reduce OpenAI API waste from errors",
                "description": f"OpenAI error rate: {error_rate:.1%}. Each error still costs API credits.",
                "benefit": f"Reduce wasted API spend by ~£{monthly_waste:.2f}/month",
                "implementation": "Add request validation before OpenAI calls. Cache common responses. Implement exponential backoff for retries.",
                "estimated_impact": {
                    "cost_reduction": f"£{monthly_waste:.2f}/month",
                    "error_rate": f"{error_rate:.1%} → <5%"
                }
            })
    
    return optimizations


def analyze_system_performance(metrics):
    """Generate system performance optimizations"""
    optimizations = []
    
    if not metrics:
        return optimizations
    
    # Placeholder for uptime/latency analysis
    # In production, this would analyze p95 latency, error rates, etc.
    
    optimizations.append({
        "id": f"perf_monitoring_baseline_{datetime.utcnow().strftime('%Y%m%d')}",
        "category": "performance",
        "priority": "low",
        "type": "info",
        "title": "Establish performance baseline",
        "description": "System is operational. Consider adding performance SLOs.",
        "benefit": "Proactive performance monitoring, early degradation detection",
        "implementation": "Define SLOs: p95 latency <500ms, error rate <1%, uptime >99.9%. Add alerting via /api/metrics/app.",
        "estimated_impact": {
            "incident_prevention": "50-70% of performance issues",
            "user_satisfaction": "+5-10%"
        }
    })
    
    return optimizations


def build_optimizations():
    """Build comprehensive optimization list"""
    log.info("Building Omega optimizations...")
    
    metrics = get_current_metrics()
    
    optimizations = []
    
    # Analyze different aspects
    optimizations.extend(analyze_ai_performance(metrics))
    optimizations.extend(analyze_gtm_conversion(metrics))
    optimizations.extend(analyze_cost_efficiency(metrics))
    optimizations.extend(analyze_system_performance(metrics))
    
    # Sort by priority
    priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    optimizations.sort(key=lambda x: priority_order.get(x["priority"], 999))
    
    return optimizations


def write_optimizations_json(optimizations):
    """Write optimizations to JSON file (atomic write with temp file)"""
    OPTIMIZATIONS_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    output = {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "optimization_count": len(optimizations),
        "by_priority": {
            "critical": len([o for o in optimizations if o["priority"] == "critical"]),
            "high": len([o for o in optimizations if o["priority"] == "high"]),
            "medium": len([o for o in optimizations if o["priority"] == "medium"]),
            "low": len([o for o in optimizations if o["priority"] == "low"])
        },
        "optimizations": optimizations
    }
    
    # Atomic write: write to temp file then rename
    temp_file = OPTIMIZATIONS_FILE.parent / f"{OPTIMIZATIONS_FILE.name}.tmp"
    try:
        with temp_file.open("w") as f:
            json.dump(output, f, indent=2)
        temp_file.rename(OPTIMIZATIONS_FILE)
        log.info(f"Wrote {len(optimizations)} optimizations to {OPTIMIZATIONS_FILE}")
    except Exception as e:
        if temp_file.exists():
            temp_file.unlink()
        raise e


def write_optimizations_log(optimizations):
    """Write human-readable optimization log"""
    OPTIMIZATIONS_LOG.parent.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.utcnow().isoformat() + "Z"
    
    entry = f"""
========================================
OMEGA OPTIMIZATIONS - {timestamp}
Total: {len(optimizations)}

"""
    
    for opt in optimizations:
        entry += f"""
[{opt['priority'].upper()}] {opt['category'].upper()}
{opt['title']}
→ {opt['description']}
→ Benefit: {opt['benefit']}
→ How: {opt['implementation']}
Impact: {json.dumps(opt['estimated_impact'], indent=2)}

"""
    
    with OPTIMIZATIONS_LOG.open("a") as f:
        f.write(entry)


def run():
    """Main entry point for omega optimization engine"""
    log.info("Omega Optimizer: Starting optimization analysis")
    
    optimizations = build_optimizations()
    
    write_optimizations_json(optimizations)
    write_optimizations_log(optimizations)
    
    priority_counts = {}
    for opt in optimizations:
        pri = opt["priority"]
        priority_counts[pri] = priority_counts.get(pri, 0) + 1
    
    log.info(f"Omega Optimizer: Complete - {len(optimizations)} optimizations ({priority_counts})")
    
    return {
        "success": True,
        "optimization_count": len(optimizations),
        "priority_counts": priority_counts
    }


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    result = run()
    print(json.dumps(result, indent=2))
