#!/usr/bin/env python3
"""
Levqor Auto-Deploy Script
=========================
Orchestrates the deployment process:
1. Runs all safety checks via run_all_checks.py
2. If checks pass, logs to AUTO_CHANGELOG.md
3. (Future) Triggers deployment to Vercel/Replit

Exit codes:
- 0: Deploy successful (or safe to deploy)
- 1: Safety checks failed - do NOT deploy

Usage:
    python scripts/ci/auto_deploy.py
    
    # Dry run (don't actually log)
    python scripts/ci/auto_deploy.py --dry-run
"""
import subprocess
import sys
import os
from datetime import datetime

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHANGELOG_FILE = os.path.join(REPO_ROOT, "AUTO_CHANGELOG.md")
SAFETY_SCRIPT = os.path.join(REPO_ROOT, "scripts", "ci", "run_all_checks.py")


def get_git_info() -> dict:
    """Get current git commit info"""
    try:
        commit_hash = subprocess.run(
            ["git", "rev-parse", "--short", "HEAD"],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True
        ).stdout.strip()
        
        commit_msg = subprocess.run(
            ["git", "log", "-1", "--pretty=%s"],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True
        ).stdout.strip()
        
        branch = subprocess.run(
            ["git", "branch", "--show-current"],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True
        ).stdout.strip()
        
        return {
            "hash": commit_hash or "unknown",
            "message": commit_msg or "No commit message",
            "branch": branch or "main"
        }
    except Exception:
        return {
            "hash": "unknown",
            "message": "No commit message",
            "branch": "main"
        }


def run_safety_checks() -> bool:
    """Run the master safety command and return True if passed"""
    print("=" * 60)
    print("LEVQOR AUTO-DEPLOY")
    print("=" * 60)
    print()
    print("Step 1: Running safety checks...")
    print("-" * 60)
    
    try:
        result = subprocess.run(
            ["python", SAFETY_SCRIPT],
            cwd=REPO_ROOT,
            timeout=600
        )
        return result.returncode == 0
    except subprocess.TimeoutExpired:
        print("[ERROR] Safety checks timed out after 600 seconds")
        return False
    except Exception as e:
        print(f"[ERROR] Failed to run safety checks: {e}")
        return False


def log_to_changelog(git_info: dict, dry_run: bool = False):
    """Append a deployment entry to AUTO_CHANGELOG.md"""
    timestamp = datetime.now().isoformat()
    entry = f"""
## Deploy: {timestamp}

- **Commit**: `{git_info['hash']}`
- **Branch**: `{git_info['branch']}`
- **Message**: {git_info['message']}
- **Status**: SAFE TO DEPLOY
- **Safety Checks**: All passed

---
"""
    
    if dry_run:
        print("[DRY RUN] Would append to AUTO_CHANGELOG.md:")
        print(entry)
        return
    
    if not os.path.exists(CHANGELOG_FILE):
        header = """# Levqor Auto-Deploy Changelog

This file is automatically updated by the auto-deploy script.
Each entry represents a verified safe deployment.

---
"""
        with open(CHANGELOG_FILE, "w") as f:
            f.write(header)
    
    with open(CHANGELOG_FILE, "a") as f:
        f.write(entry)
    
    print(f"[OK] Logged to {CHANGELOG_FILE}")


def main():
    dry_run = "--dry-run" in sys.argv
    
    if dry_run:
        print("[DRY RUN MODE]")
        print()
    
    if not run_safety_checks():
        print()
        print("=" * 60)
        print("DEPLOY BLOCKED")
        print("=" * 60)
        print()
        print("Safety checks FAILED. Do NOT deploy.")
        print("Fix the issues above and re-run.")
        sys.exit(1)
    
    print()
    print("-" * 60)
    print("Step 2: Logging deployment...")
    print("-" * 60)
    
    git_info = get_git_info()
    print(f"Commit: {git_info['hash']}")
    print(f"Branch: {git_info['branch']}")
    print(f"Message: {git_info['message']}")
    print()
    
    log_to_changelog(git_info, dry_run)
    
    print()
    print("=" * 60)
    print("SAFE TO DEPLOY")
    print("=" * 60)
    print()
    print("All safety checks passed.")
    print("Deployment can proceed.")
    print()
    print("Next steps (when deployment APIs are wired):")
    print("  - Vercel: Deploy frontend to production")
    print("  - Replit: Restart backend workflows")
    print()
    
    sys.exit(0)


if __name__ == "__main__":
    main()
