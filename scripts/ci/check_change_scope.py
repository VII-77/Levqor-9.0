#!/usr/bin/env python3
"""
Levqor Change Scope Checker
============================
Analyzes a list of changed files and categorizes them as:
- CRITICAL: Auth, billing, database, core API
- NON-CRITICAL: Marketing, docs, copy, templates
- MIXED: Both critical and non-critical changes

Usage:
    # From git diff
    git diff --name-only | python scripts/ci/check_change_scope.py
    
    # From file list
    python scripts/ci/check_change_scope.py file1.py file2.ts
    
    # Test mode with sample files
    python scripts/ci/check_change_scope.py --test

Exit codes:
- 0: Non-critical only (safe for fast-track deploy)
- 1: Critical changes detected (requires full safety checks)
- 2: Mixed changes (requires full safety checks)
"""
import sys
import os
import fnmatch
from typing import List, Tuple

try:
    import yaml
except ImportError:
    print("[ERROR] PyYAML not installed. Run: pip install pyyaml")
    sys.exit(1)

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
POLICY_FILE = os.path.join(REPO_ROOT, "auto_upgrade_policy.yml")


def load_policy() -> dict:
    """Load the auto-upgrade policy from YAML file"""
    if not os.path.exists(POLICY_FILE):
        print(f"[ERROR] Policy file not found: {POLICY_FILE}")
        sys.exit(1)
    
    with open(POLICY_FILE, "r") as f:
        return yaml.safe_load(f)


def match_pattern(filepath: str, patterns: List[str]) -> bool:
    """Check if a filepath matches any of the given glob patterns"""
    filepath = filepath.replace("\\", "/")
    
    for pattern in patterns:
        pattern = pattern.replace("\\", "/")
        
        if "**" in pattern:
            parts = pattern.split("**")
            if len(parts) == 2:
                prefix, suffix = parts
                if filepath.startswith(prefix.rstrip("/")) and filepath.endswith(suffix.lstrip("/")):
                    return True
                if fnmatch.fnmatch(filepath, pattern.replace("**", "*")):
                    return True
        elif fnmatch.fnmatch(filepath, pattern):
            return True
        elif pattern.endswith("/") and filepath.startswith(pattern):
            return True
        elif filepath == pattern:
            return True
    
    return False


def categorize_file(filepath: str, policy: dict) -> str:
    """Categorize a single file as CRITICAL, NON-CRITICAL, or UNKNOWN"""
    protected = policy.get("protected_files", [])
    critical = policy.get("critical_modules", [])
    non_critical = policy.get("non_critical_modules", [])
    
    if match_pattern(filepath, protected):
        return "PROTECTED"
    
    if match_pattern(filepath, critical):
        return "CRITICAL"
    
    if match_pattern(filepath, non_critical):
        return "NON_CRITICAL"
    
    return "UNKNOWN"


def analyze_changes(files: List[str]) -> Tuple[str, dict]:
    """
    Analyze a list of changed files and return the overall scope.
    
    Returns:
        Tuple of (scope, details)
        scope: "CRITICAL", "NON_CRITICAL", "MIXED", or "PROTECTED"
        details: dict with categorized files
    """
    policy = load_policy()
    
    results = {
        "PROTECTED": [],
        "CRITICAL": [],
        "NON_CRITICAL": [],
        "UNKNOWN": []
    }
    
    for filepath in files:
        filepath = filepath.strip()
        if not filepath:
            continue
        category = categorize_file(filepath, policy)
        results[category].append(filepath)
    
    if results["PROTECTED"]:
        return "PROTECTED", results
    
    has_critical = bool(results["CRITICAL"] or results["UNKNOWN"])
    has_non_critical = bool(results["NON_CRITICAL"])
    
    if has_critical and has_non_critical:
        return "MIXED", results
    elif has_critical:
        return "CRITICAL", results
    elif has_non_critical:
        return "NON_CRITICAL", results
    else:
        return "UNKNOWN", results


def main():
    if "--test" in sys.argv:
        test_files = [
            "levqor-site/src/auth.ts",
            "api/billing/checkout.py",
            "levqor-site/messages/en.json",
            "README.md",
            "run.py"
        ]
        print("TEST MODE: Analyzing sample files")
        print("-" * 40)
        for f in test_files:
            print(f"  {f}")
        print("-" * 40)
        files = test_files
    elif len(sys.argv) > 1 and sys.argv[1] != "--test":
        files = sys.argv[1:]
    else:
        files = [line.strip() for line in sys.stdin.readlines()]
    
    if not files:
        print("No files to analyze")
        sys.exit(0)
    
    scope, details = analyze_changes(files)
    
    print(f"\nCHANGE SCOPE: {scope}")
    print("=" * 40)
    
    for category in ["PROTECTED", "CRITICAL", "NON_CRITICAL", "UNKNOWN"]:
        if details[category]:
            print(f"\n{category} ({len(details[category])} files):")
            for f in details[category][:10]:
                print(f"  - {f}")
            if len(details[category]) > 10:
                print(f"  ... and {len(details[category]) - 10} more")
    
    print("\n" + "=" * 40)
    
    if scope == "PROTECTED":
        print("RESULT: PROTECTED files detected")
        print("ACTION: Manual review required - do NOT auto-upgrade")
        sys.exit(3)
    elif scope == "CRITICAL":
        print("RESULT: Critical changes detected")
        print("ACTION: Run full safety checks before deploy")
        sys.exit(1)
    elif scope == "MIXED":
        print("RESULT: Mixed critical and non-critical changes")
        print("ACTION: Run full safety checks before deploy")
        sys.exit(2)
    elif scope == "NON_CRITICAL":
        print("RESULT: Non-critical changes only")
        print("ACTION: Fast-track deployment allowed (still run safety gate)")
        sys.exit(0)
    else:
        print("RESULT: Unknown scope - treating as critical")
        print("ACTION: Run full safety checks before deploy")
        sys.exit(1)


if __name__ == "__main__":
    main()
