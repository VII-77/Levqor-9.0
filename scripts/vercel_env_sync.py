#!/usr/bin/env python3
"""
Vercel Environment Sync Script
Syncs Stripe price IDs from .env.production to Vercel project environment.
"""

import os
import sys
import json
import argparse
from pathlib import Path

try:
    import requests
except ImportError:
    print("ERROR: requests package not installed. Run: pip install requests")
    sys.exit(1)

ENV_FILE = Path(__file__).parent.parent / "levqor-site" / ".env.production"
if not ENV_FILE.exists():
    ENV_FILE = Path(__file__).parent.parent / ".env.production"

STRIPE_KEYS = [
    "STRIPE_PRICE_STARTER",
    "STRIPE_PRICE_STARTER_YEAR",
    "STRIPE_PRICE_LAUNCH",
    "STRIPE_PRICE_LAUNCH_YEAR",
    "STRIPE_PRICE_GROWTH",
    "STRIPE_PRICE_GROWTH_YEAR",
    "STRIPE_PRICE_AGENCY",
    "STRIPE_PRICE_AGENCY_YEAR",
    "STRIPE_PRICE_DFY_STARTER",
    "STRIPE_PRICE_DFY_PROFESSIONAL",
    "STRIPE_PRICE_DFY_ENTERPRISE",
    "STRIPE_PRICE_ADDON_PRIORITY_SUPPORT",
    "STRIPE_PRICE_ADDON_SLA_99",
    "STRIPE_PRICE_ADDON_WHITE_LABEL",
    "STRIPE_PRICE_ADDON_EXTRA_WORKFLOWS",
]

AUTH_KEYS = [
    "NEXTAUTH_SECRET",
    "NEXTAUTH_URL",
]

ALL_SYNC_KEYS = STRIPE_KEYS + AUTH_KEYS

def parse_env_file(filepath: Path) -> dict:
    """Parse .env file into a dictionary."""
    env_vars = {}
    if not filepath.exists():
        return env_vars
    
    with open(filepath) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                key, _, value = line.partition("=")
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                if key and value:
                    env_vars[key] = value
    return env_vars

def get_env_value(key: str, file_env: dict) -> str:
    """Get env value from file or environment."""
    return file_env.get(key) or os.environ.get(key, "")

def truncate(s: str, length: int = 20) -> str:
    """Truncate string for display."""
    if not s:
        return "(empty)"
    if len(s) > length:
        return s[:length-3] + "..."
    return s

class VercelAPI:
    def __init__(self, token: str, project_id: str, team_id: str = None):
        self.token = token
        self.project_id = project_id
        self.team_id = team_id
        self.base_url = "https://api.vercel.com"
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    
    def _add_team_param(self, url: str) -> str:
        """Add team ID to URL if available."""
        if self.team_id:
            separator = "&" if "?" in url else "?"
            return f"{url}{separator}teamId={self.team_id}"
        return url
    
    def get_env_vars(self) -> dict:
        """Fetch existing environment variables."""
        url = f"{self.base_url}/v9/projects/{self.project_id}/env?decrypt=true"
        url = self._add_team_param(url)
        
        response = requests.get(url, headers=self.headers)
        if response.status_code != 200:
            print(f"ERROR: Failed to fetch env vars: {response.status_code}")
            print(response.text)
            return {}
        
        data = response.json()
        env_map = {}
        for env in data.get("envs", []):
            env_map[env["key"]] = {
                "id": env["id"],
                "value": env.get("value", ""),
                "target": env.get("target", []),
                "type": env.get("type", "encrypted")
            }
        return env_map
    
    def create_env_var(self, key: str, value: str) -> bool:
        """Create a new environment variable."""
        url = f"{self.base_url}/v10/projects/{self.project_id}/env"
        url = self._add_team_param(url)
        
        payload = {
            "key": key,
            "value": value,
            "target": ["production"],
            "type": "encrypted"
        }
        
        response = requests.post(url, headers=self.headers, json=payload)
        if response.status_code in [200, 201]:
            return True
        print(f"ERROR creating {key}: {response.status_code} - {response.text}")
        return False
    
    def update_env_var(self, env_id: str, value: str) -> bool:
        """Update an existing environment variable."""
        url = f"{self.base_url}/v9/projects/{self.project_id}/env/{env_id}"
        url = self._add_team_param(url)
        
        payload = {
            "value": value,
            "target": ["production"]
        }
        
        response = requests.patch(url, headers=self.headers, json=payload)
        if response.status_code == 200:
            return True
        print(f"ERROR updating {env_id}: {response.status_code} - {response.text}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Sync env vars to Vercel")
    parser.add_argument("--dry-run", action="store_true", help="Show changes without applying")
    args = parser.parse_args()
    
    print("=" * 80)
    print("VERCEL ENVIRONMENT SYNC")
    print("=" * 80)
    
    if args.dry_run:
        print("\n*** DRY RUN MODE - No changes will be made ***\n")
    
    token = os.environ.get("VERCEL_TOKEN") or os.environ.get("VERCEL_API_TOKEN")
    project_id = os.environ.get("VERCEL_PROJECT_ID")
    team_id = os.environ.get("VERCEL_TEAM_ID") or os.environ.get("VERCEL_ORG_ID")
    
    if not token:
        print("ERROR: VERCEL_TOKEN or VERCEL_API_TOKEN not set")
        sys.exit(1)
    if not project_id:
        print("ERROR: VERCEL_PROJECT_ID not set")
        sys.exit(1)
    
    print(f"Project ID: {project_id}")
    print(f"Team ID: {team_id or '(none)'}")
    print(f"Env file: {ENV_FILE}")
    
    file_env = parse_env_file(ENV_FILE)
    
    local_values = {}
    for key in ALL_SYNC_KEYS:
        value = get_env_value(key, file_env)
        if value:
            local_values[key] = value
    
    print(f"\nLocal keys found: {len(local_values)}/{len(ALL_SYNC_KEYS)}")
    
    if not args.dry_run:
        api = VercelAPI(token, project_id, team_id)
        print("\nFetching Vercel env vars...")
        vercel_env = api.get_env_vars()
        print(f"Vercel env vars fetched: {len(vercel_env)}")
    else:
        vercel_env = {}
    
    print("\n" + "-" * 80)
    print(f"{'KEY':<40} | {'ACTION':<12} | {'VALUE':<25}")
    print("-" * 80)
    
    results = []
    errors = 0
    
    for key in ALL_SYNC_KEYS:
        local_value = local_values.get(key, "")
        
        if not local_value:
            action = "SKIP"
            message = "(not in local env)"
            results.append((key, action, message))
            print(f"{key:<40} | {action:<12} | {message}")
            continue
        
        if args.dry_run:
            action = "WOULD SYNC"
            message = truncate(local_value)
            results.append((key, action, message))
            print(f"{key:<40} | {action:<12} | {message}")
            continue
        
        existing = vercel_env.get(key)
        
        if existing:
            if existing["value"] == local_value:
                action = "UNCHANGED"
                message = truncate(local_value)
            else:
                success = api.update_env_var(existing["id"], local_value)
                if success:
                    action = "UPDATED"
                    message = truncate(local_value)
                else:
                    action = "ERROR"
                    message = "Update failed"
                    errors += 1
        else:
            success = api.create_env_var(key, local_value)
            if success:
                action = "CREATED"
                message = truncate(local_value)
            else:
                action = "ERROR"
                message = "Create failed"
                errors += 1
        
        results.append((key, action, message))
        print(f"{key:<40} | {action:<12} | {message}")
    
    print("-" * 80)
    
    print("\n" + "=" * 80)
    if args.dry_run:
        print("DRY RUN COMPLETE - No changes made to Vercel")
    elif errors == 0:
        print("SYNC COMPLETE - All env vars synchronized to Vercel")
    else:
        print(f"SYNC COMPLETED WITH {errors} ERRORS")
    print("=" * 80)
    
    sys.exit(1 if errors > 0 else 0)

if __name__ == "__main__":
    main()
