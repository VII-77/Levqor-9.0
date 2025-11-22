#!/usr/bin/env python3
import sys
import time
from typing import List, Tuple

import requests

CHECKS: List[Tuple[str, str]] = [
    ("frontend_root", "https://www.levqor.ai/"),
    ("dashboard_v2", "https://www.levqor.ai/dashboard/v2"),
    ("api_health", "https://api.levqor.ai/health"),
]

TIMEOUT_SECONDS = 10


def check_url(name: str, url: str) -> bool:
    try:
        start = time.time()
        resp = requests.get(url, timeout=TIMEOUT_SECONDS, allow_redirects=True)
        elapsed = time.time() - start
        status = resp.status_code

        print(f"[{name}] {url} -> {status} in {elapsed:.2f}s")

        # Consider 2xx and 3xx as OK (dashboard may redirect to login)
        if 200 <= status < 400:
            return True
        return False
    except Exception as e:
        print(f"[{name}] {url} -> ERROR: {e}")
        return False


def main() -> int:
    print("=== Levqor Deployment Health Check ===")
    all_ok = True
    for name, url in CHECKS:
        ok = check_url(name, url)
        if not ok:
            all_ok = False

    if all_ok:
        print("RESULT: OK — all endpoints healthy")
        return 0
    else:
        print("RESULT: FAIL — one or more endpoints unhealthy")
        return 1


if __name__ == "__main__":
    sys.exit(main())
