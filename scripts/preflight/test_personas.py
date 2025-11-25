#!/usr/bin/env python3
"""
Preflight Persona Test Script - MEGA PHASE v26
Simulates user journey personas to verify system readiness.

This script outlines test scenarios rather than full E2E automation.
Use as a checklist before launch.

Usage:
    python scripts/preflight/test_personas.py
"""
import os
import sys
import json
import requests
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

API_BASE = os.environ.get("API_BASE", "http://localhost:8000")

PERSONAS = [
    {
        "id": "persona_a",
        "name": "New User - Template Journey",
        "description": "New user signs up, browses templates, selects one, and runs a workflow",
        "steps": [
            {"action": "visit", "target": "/signup", "expected": "Sign up form loads"},
            {"action": "register", "target": "/api/auth/register", "expected": "Account created"},
            {"action": "visit", "target": "/templates", "expected": "Template marketplace loads"},
            {"action": "select_template", "target": "/api/templates", "expected": "Templates list returns"},
            {"action": "create_workflow", "target": "/api/workflows", "expected": "Workflow created from template"},
            {"action": "run_workflow", "target": "/api/workflows/<id>/run", "expected": "Workflow executes successfully"},
        ]
    },
    {
        "id": "persona_b",
        "name": "New User - AI Builder Journey",
        "description": "New user uses Levqor Brain to create a workflow, goes through approval",
        "steps": [
            {"action": "visit", "target": "/signup", "expected": "Sign up form loads"},
            {"action": "register", "target": "/api/auth/register", "expected": "Account created"},
            {"action": "visit", "target": "/builder", "expected": "Brain builder loads"},
            {"action": "ai_build", "target": "/api/ai/brain/build_workflow", "expected": "AI generates workflow proposal"},
            {"action": "submit_workflow", "target": "/api/ai/brain/submit_workflow", "expected": "Workflow submitted"},
            {"action": "check_approvals", "target": "/api/approvals", "expected": "Approval queue accessible"},
            {"action": "approve_workflow", "target": "/api/approvals/<id>/approve", "expected": "Workflow approved"},
            {"action": "run_workflow", "target": "/api/workflows/<id>/run", "expected": "Workflow executes"},
        ]
    },
    {
        "id": "persona_c",
        "name": "Returning User - Analytics Journey",
        "description": "Returning user checks dashboard analytics and workflow history",
        "steps": [
            {"action": "login", "target": "/signin", "expected": "Login successful"},
            {"action": "visit", "target": "/dashboard", "expected": "Dashboard loads with data"},
            {"action": "check_analytics", "target": "/api/analytics/overview", "expected": "Analytics data returns"},
            {"action": "view_history", "target": "/api/workflows/runs", "expected": "Run history loads"},
            {"action": "check_health", "target": "/api/health/summary", "expected": "Health status OK"},
        ]
    }
]


def print_header(text: str):
    """Print a formatted header."""
    print("\n" + "=" * 60)
    print(f" {text}")
    print("=" * 60)


def print_step(step_num: int, step: dict, status: str = "TODO"):
    """Print a formatted step."""
    icons = {"PASS": "✓", "FAIL": "✗", "TODO": "○", "SKIP": "◌"}
    icon = icons.get(status, "?")
    print(f"  {icon} Step {step_num}: {step['action']} → {step['target']}")
    print(f"      Expected: {step['expected']}")


def check_api_endpoint(endpoint: str) -> bool:
    """Check if an API endpoint is reachable."""
    try:
        url = f"{API_BASE}{endpoint}"
        response = requests.get(url, timeout=5)
        return response.status_code < 500
    except Exception:
        return False


def run_quick_checks() -> dict:
    """Run quick API health checks."""
    checks = {
        "health": check_api_endpoint("/api/health/summary"),
        "templates": check_api_endpoint("/api/templates"),
        "workflows": check_api_endpoint("/api/workflows"),
        "analytics": check_api_endpoint("/api/analytics/overview"),
        "brain": check_api_endpoint("/api/ai/brain/build_workflow"),
    }
    return checks


def main():
    print_header("LEVQOR PREFLIGHT PERSONA TESTS")
    print(f"Timestamp: {datetime.utcnow().isoformat()}")
    print(f"API Base: {API_BASE}")
    
    print("\n--- Quick API Checks ---")
    checks = run_quick_checks()
    for name, status in checks.items():
        icon = "✓" if status else "✗"
        print(f"  {icon} {name}: {'OK' if status else 'UNREACHABLE'}")
    
    all_pass = all(checks.values())
    
    for persona in PERSONAS:
        print_header(f"PERSONA: {persona['name']}")
        print(f"Description: {persona['description']}")
        print("\nTest Steps (Manual Verification Required):")
        
        for i, step in enumerate(persona["steps"], 1):
            print_step(i, step, "TODO")
    
    print_header("SUMMARY")
    print(f"API Health: {'PASS' if all_pass else 'FAIL'}")
    print(f"Personas Defined: {len(PERSONAS)}")
    print(f"Total Steps: {sum(len(p['steps']) for p in PERSONAS)}")
    print("\nNote: This script provides a checklist for manual QA testing.")
    print("Full E2E automation would require Playwright/Cypress integration.")
    
    print("\n--- Recommendations ---")
    if not checks.get("health"):
        print("  ! Start the backend server before running preflight tests")
    if not checks.get("brain"):
        print("  ! Verify AI Brain endpoint is configured with API keys")
    
    print("\nRun this script before each deployment to verify persona journeys.")
    
    return 0 if all_pass else 1


if __name__ == "__main__":
    sys.exit(main())
