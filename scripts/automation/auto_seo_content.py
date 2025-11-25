"""
SEO & Content Engine - MEGA PHASE v19
Generates SEO suggestions for key pages without auto-editing.
Class A operation (read + suggestions only).

Usage:
    python scripts/automation/auto_seo_content.py
    
Output:
    logs/seo_suggestions.json
"""
import json
import os
import sys
from datetime import datetime
from typing import Dict, List, Optional

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

ROUTES_TO_OPTIMIZE = [
    {
        "route": "/",
        "name": "Homepage",
        "current_title": "Levqor – Automate work. Ship faster. Pay only for results.",
        "current_description": "Levqor is the AI-powered automation layer for agencies and teams. Automate workflows, ship client work faster, and only pay for successful results.",
        "current_h1": "Automate work. Ship faster. Pay only for results.",
        "priority": "high"
    },
    {
        "route": "/pricing",
        "name": "Pricing Page",
        "current_title": "Pricing | Levqor",
        "current_description": "Simple, transparent pricing for workflow automation. Start with a 7-day free trial.",
        "current_h1": "Simple, transparent pricing",
        "priority": "high"
    },
    {
        "route": "/dashboard",
        "name": "Dashboard",
        "current_title": "Dashboard | Levqor",
        "current_description": "Manage your workflows and automations.",
        "current_h1": "Welcome back",
        "priority": "medium"
    },
    {
        "route": "/support",
        "name": "Support Page",
        "current_title": "Support | Levqor",
        "current_description": "Get help with Levqor workflows and automation.",
        "current_h1": "How can we help?",
        "priority": "medium"
    },
    {
        "route": "/templates",
        "name": "Templates Marketplace",
        "current_title": "Templates | Levqor",
        "current_description": "Browse workflow templates to get started quickly.",
        "current_h1": "Workflow Templates",
        "priority": "high"
    },
    {
        "route": "/about",
        "name": "About Page",
        "current_title": "About | Levqor",
        "current_description": "Learn about Levqor's mission to democratize automation.",
        "current_h1": "About Levqor",
        "priority": "low"
    },
    {
        "route": "/how-it-works",
        "name": "How It Works",
        "current_title": "How It Works | Levqor",
        "current_description": "See how Levqor automates your workflows in 3 simple steps.",
        "current_h1": "How Levqor Works",
        "priority": "medium"
    },
    {
        "route": "/security",
        "name": "Security Page",
        "current_title": "Security | Levqor",
        "current_description": "Enterprise-grade security for your automation workflows.",
        "current_h1": "Security & Compliance",
        "priority": "medium"
    }
]

SEO_BEST_PRACTICES = {
    "title_length": {"min": 30, "max": 60},
    "description_length": {"min": 120, "max": 160},
    "h1_length": {"min": 20, "max": 70}
}

TARGET_KEYWORDS = [
    "workflow automation",
    "no-code automation",
    "zapier alternative",
    "make.com alternative",
    "ai automation",
    "self-healing workflows",
    "business automation",
    "automation platform",
    "agency automation",
    "workflow templates"
]


def analyze_text_length(text: str, field_type: str) -> Dict:
    """Analyze text length against SEO best practices."""
    length = len(text)
    limits = SEO_BEST_PRACTICES.get(field_type, {"min": 0, "max": 100})
    
    return {
        "length": length,
        "min_recommended": limits["min"],
        "max_recommended": limits["max"],
        "status": "good" if limits["min"] <= length <= limits["max"] else (
            "too_short" if length < limits["min"] else "too_long"
        )
    }


def check_keyword_presence(text: str) -> List[str]:
    """Check which target keywords are present in text."""
    text_lower = text.lower()
    return [kw for kw in TARGET_KEYWORDS if kw.lower() in text_lower]


def generate_suggestions(route_config: Dict) -> Dict:
    """Generate SEO suggestions for a route."""
    suggestions = {
        "route": route_config["route"],
        "name": route_config["name"],
        "priority": route_config["priority"],
        "current": {
            "title": route_config["current_title"],
            "description": route_config["current_description"],
            "h1": route_config["current_h1"]
        },
        "analysis": {},
        "suggestions": {},
        "keywords_found": [],
        "generated_at": datetime.utcnow().isoformat()
    }
    
    suggestions["analysis"]["title"] = analyze_text_length(
        route_config["current_title"], "title_length"
    )
    suggestions["analysis"]["description"] = analyze_text_length(
        route_config["current_description"], "description_length"
    )
    suggestions["analysis"]["h1"] = analyze_text_length(
        route_config["current_h1"], "h1_length"
    )
    
    all_text = f"{route_config['current_title']} {route_config['current_description']} {route_config['current_h1']}"
    suggestions["keywords_found"] = check_keyword_presence(all_text)
    
    if route_config["route"] == "/":
        suggestions["suggestions"] = {
            "title": {
                "suggested": "Levqor – AI Workflow Automation | Self-Healing No-Code Platform",
                "reason": "Includes primary keywords 'workflow automation' and 'no-code' for better SEO ranking"
            },
            "description": {
                "suggested": "Automate business workflows with AI-powered self-healing automation. Zapier alternative for agencies and teams. 7-day free trial. Pay only for successful runs.",
                "reason": "Includes competitive keywords and clear value proposition within 160 chars"
            },
            "h1": {
                "suggested": "AI-Powered Workflow Automation That Self-Heals",
                "reason": "More specific and keyword-rich than current generic h1"
            },
            "key_bullets": [
                "Self-healing workflows that fix themselves",
                "Connect 50+ apps without code",
                "Pay only for successful automation runs"
            ]
        }
    elif route_config["route"] == "/pricing":
        suggestions["suggestions"] = {
            "title": {
                "suggested": "Pricing – Workflow Automation Plans | Levqor",
                "reason": "Includes 'workflow automation' keyword for search visibility"
            },
            "description": {
                "suggested": "Transparent pricing for AI workflow automation. Plans from £9/mo. 7-day free trial on all plans. No credit card required to start.",
                "reason": "Includes pricing signal, trial info, and removes friction mention"
            },
            "h1": {
                "suggested": "Workflow Automation Pricing",
                "reason": "Keyword-focused h1 for pricing page SEO"
            },
            "key_bullets": [
                "Start free for 7 days",
                "No credit card required",
                "Cancel anytime"
            ]
        }
    elif route_config["route"] == "/templates":
        suggestions["suggestions"] = {
            "title": {
                "suggested": "Workflow Templates – Ready-Made Automations | Levqor",
                "reason": "Descriptive title with automation keywords"
            },
            "description": {
                "suggested": "Browse 20+ ready-made workflow templates for lead capture, sales automation, customer support, and reporting. Start automating in minutes.",
                "reason": "Mentions template count and specific use cases"
            },
            "h1": {
                "suggested": "Ready-Made Workflow Templates",
                "reason": "Action-oriented h1 emphasizing quick start"
            },
            "key_bullets": [
                "One-click template installation",
                "Customizable for your needs",
                "New templates added weekly"
            ]
        }
    elif route_config["route"] == "/dashboard":
        suggestions["suggestions"] = {
            "title": {
                "suggested": "Dashboard – Manage Workflows | Levqor",
                "reason": "Clear purpose statement for authenticated page"
            },
            "description": {
                "suggested": "Manage your automated workflows, monitor runs, and track performance from your Levqor dashboard.",
                "reason": "Describes dashboard functionality"
            },
            "h1": {
                "suggested": "Your Automation Dashboard",
                "reason": "Personalized and descriptive"
            },
            "key_bullets": [
                "Real-time workflow status",
                "Performance analytics",
                "Quick actions"
            ]
        }
    elif route_config["route"] == "/support":
        suggestions["suggestions"] = {
            "title": {
                "suggested": "Support – Help Center | Levqor",
                "reason": "Standard support page title format"
            },
            "description": {
                "suggested": "Get help with Levqor workflow automation. Browse FAQs, contact support, or access documentation.",
                "reason": "Lists available support options"
            },
            "h1": {
                "suggested": "How Can We Help You?",
                "reason": "Friendly, action-oriented support h1"
            },
            "key_bullets": [
                "Search knowledge base",
                "Contact support team",
                "View documentation"
            ]
        }
    else:
        suggestions["suggestions"] = {
            "title": {
                "suggested": f"{route_config['name']} – Workflow Automation | Levqor",
                "reason": "Generic suggestion following brand pattern"
            },
            "description": {
                "suggested": route_config["current_description"],
                "reason": "Current description is acceptable"
            },
            "h1": {
                "suggested": route_config["current_h1"],
                "reason": "Current h1 is acceptable"
            },
            "key_bullets": []
        }
    
    return suggestions


def run_seo_analysis() -> Dict:
    """Run SEO analysis on all configured routes."""
    results = {
        "generated_at": datetime.utcnow().isoformat(),
        "version": "v19.0",
        "impact_class": "A",
        "impact_reason": "Read-only suggestions, no auto-editing",
        "total_routes": len(ROUTES_TO_OPTIMIZE),
        "target_keywords": TARGET_KEYWORDS,
        "routes": []
    }
    
    for route_config in ROUTES_TO_OPTIMIZE:
        suggestion = generate_suggestions(route_config)
        results["routes"].append(suggestion)
    
    high_priority = [r for r in results["routes"] if r["priority"] == "high"]
    results["summary"] = {
        "high_priority_count": len(high_priority),
        "routes_needing_title_update": len([
            r for r in results["routes"] 
            if r["analysis"]["title"]["status"] != "good"
        ]),
        "routes_needing_description_update": len([
            r for r in results["routes"]
            if r["analysis"]["description"]["status"] != "good"
        ]),
        "routes_with_keywords": len([
            r for r in results["routes"]
            if len(r["keywords_found"]) >= 2
        ])
    }
    
    return results


def main():
    """Main entry point."""
    print("=" * 60)
    print("LEVQOR SEO CONTENT ENGINE (v19)")
    print("=" * 60)
    print(f"Started at: {datetime.utcnow().isoformat()}")
    print(f"Impact Class: A (read-only suggestions)")
    print()
    
    os.makedirs("logs", exist_ok=True)
    
    print("[1/2] Running SEO analysis...")
    results = run_seo_analysis()
    
    output_path = "logs/seo_suggestions.json"
    print(f"[2/2] Writing suggestions to {output_path}...")
    
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2)
    
    print()
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Routes analyzed: {results['total_routes']}")
    print(f"High priority routes: {results['summary']['high_priority_count']}")
    print(f"Routes needing title update: {results['summary']['routes_needing_title_update']}")
    print(f"Routes needing description update: {results['summary']['routes_needing_description_update']}")
    print(f"Routes with good keyword coverage: {results['summary']['routes_with_keywords']}")
    print()
    print(f"Suggestions saved to: {output_path}")
    print()
    print("NOTE: These are suggestions only. Changing SEO copy is a Class C")
    print("action and must be applied manually or via the approval flow.")
    print("=" * 60)
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
