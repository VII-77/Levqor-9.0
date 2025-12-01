#!/usr/bin/env python3
"""
Levqor V12.12 Enterprise - Backend Keep-Alive Pinger
Prevents cold starts and detects backend downtime early.

Usage:
    python scripts/backend_keepalive.py

Exit codes:
    0 - Always (non-blocking, for monitoring only)
"""

import sys
import requests
from datetime import datetime
import json

BACKEND_URL = "https://api.levqor.ai/health"
TIMEOUT_SECONDS = 10


def main():
    timestamp = datetime.utcnow().isoformat() + "Z"
    
    try:
        print(f"[{timestamp}] Pinging backend: {BACKEND_URL}")
        
        response = requests.get(BACKEND_URL, timeout=TIMEOUT_SECONDS)
        
        if response.status_code == 200:
            try:
                data = response.json()
                version = data.get("version", "unknown")
                build = data.get("build", "unknown")
                uptime = data.get("uptime_seconds", 0)
                
                print(f"[{timestamp}] ✅ Backend healthy - Status: {response.status_code} | Version: {version} | Build: {build} | Uptime: {uptime}s")
            except json.JSONDecodeError:
                print(f"[{timestamp}] ✅ Backend responded - Status: {response.status_code} | Body: {response.text[:200]}")
        else:
            # Log non-200 responses
            print(f"[{timestamp}] ⚠️  Backend returned non-200 - Status: {response.status_code} | Body: {response.text[:500]}")
    
    except requests.Timeout:
        print(f"[{timestamp}] ❌ Backend timeout after {TIMEOUT_SECONDS}s - URL: {BACKEND_URL}")
    
    except requests.ConnectionError as e:
        print(f"[{timestamp}] ❌ Backend connection failed - Error: {str(e)[:300]}")
    
    except Exception as e:
        print(f"[{timestamp}] ❌ Unexpected error - Type: {type(e).__name__} | Message: {str(e)[:300]}")
    
    # Always exit 0 - this is for monitoring, not blocking
    return 0


if __name__ == "__main__":
    sys.exit(main())


# Verification commands:
# python scripts/backend_keepalive.py
# Expected output: Backend health check with status, version, and uptime
