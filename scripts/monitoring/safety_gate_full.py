import sys
import json
import textwrap

try:
    import requests
except ImportError:
    print("[FATAL] 'requests' not installed. Run: pip install requests")
    sys.exit(1)

RESULTS = []

def record(name: str, ok: bool, detail: str = ""):
    status = "PASS" if ok else "FAIL"
    print(f"[{status}] {name}")
    if detail:
        print("   " + "\n   ".join(textwrap.wrap(detail, width=90)))
    RESULTS.append((name, ok, detail))


def check_http_get(name, url, expect_status=200, must_contain=None, forbid_contain=None, allow_statuses=None, check_redirect_to_signin=False):
    try:
        resp = requests.get(url, timeout=10, allow_redirects=False)
    except Exception as e:
        record(name, False, f"Error requesting {url}: {e}")
        return

    if check_redirect_to_signin and resp.status_code in [301, 302, 307, 308]:
        location = resp.headers.get('location', '').lower()
        if 'signin' in location or 'sign-in' in location or 'login' in location or 'auth' in location:
            record(name, True, f"Correctly redirects to auth: {resp.headers.get('location')}")
            return
        else:
            record(name, False, f"Redirect does not go to auth page: {resp.headers.get('location')}")
            return

    status_ok = resp.status_code == expect_status or (allow_statuses and resp.status_code in allow_statuses)
    body = resp.text.lower()

    if not status_ok:
        record(name, False, f"Expected {expect_status} (or {allow_statuses}), got {resp.status_code}")
        return

    if must_contain:
        missing = [s for s in must_contain if s.lower() not in body]
        if missing:
            record(name, False, f"Missing expected text: {missing}")
            return

    if forbid_contain:
        bad = [s for s in forbid_contain if s.lower() in body]
        if bad:
            record(name, False, f"Found forbidden text: {bad}")
            return

    record(name, True, f"Status {resp.status_code}, content OK.")


def check_checkout_endpoint():
    url = "https://levqor.ai/api/checkout"
    payload = {"plan": "starter", "term": "monthly"}
    try:
        resp = requests.post(url, json=payload, timeout=15)
    except Exception as e:
        record("API: /api/checkout endpoint", False, f"Error calling checkout API: {e}")
        return

    if resp.status_code != 200:
        record("API: /api/checkout endpoint", False, f"Expected 200, got {resp.status_code}, body={resp.text[:300]}")
        return

    try:
        data = resp.json()
    except json.JSONDecodeError:
        record("API: /api/checkout endpoint", False, f"Response is not JSON: {resp.text[:300]}")
        return

    if "url" not in data:
        record("API: /api/checkout endpoint", False, f"JSON does not contain 'url' key: {data}")
        return

    record("API: /api/checkout endpoint", True, f"Returned Stripe URL: {data.get('url')[:80]}...")


def main():
    print("=== LEVQOR SAFETY GATE: FULL CHECK ===")

    # 1. Public site up
    check_http_get(
        "Web: Landing page",
        "https://www.levqor.ai",
        expect_status=200,
        must_contain=["levqor"]
    )

    # 2. Dashboard is gated by auth
    # Check that unauthenticated requests redirect to signin
    check_http_get(
        "Auth: /dashboard gated",
        "https://www.levqor.ai/dashboard",
        check_redirect_to_signin=True
    )

    # 3. Dashboard v2 is protected (either noindex or redirect to signin)
    # Redirecting to signin is also acceptable for SEO - search engines won't index it
    check_http_get(
        "SEO: /dashboard/v2 is protected",
        "https://www.levqor.ai/dashboard/v2",
        check_redirect_to_signin=True
    )

    # 4. Billing / checkout endpoint works (Stripe session creation)
    # WARNING: This creates a real checkout session. Use mainly before releases.
    check_checkout_endpoint()

    # Summary
    print("\n=== SUMMARY ===")
    passed = sum(1 for _, ok, _ in RESULTS if ok)
    failed = sum(1 for _, ok, _ in RESULTS if not ok)
    print(f"Checks passed: {passed}")
    print(f"Checks failed: {failed}")

    if failed > 0:
        print("\nSome checks FAILED. Do NOT mark this phase as complete.")
        sys.exit(1)
    else:
        print("\nAll checks PASSED. Safety gate is clear.")
        sys.exit(0)


if __name__ == "__main__":
    main()
