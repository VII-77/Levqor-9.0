#!/usr/bin/env python3
"""
Founder Digest - Guardian Autopilot Grid

Generates a comprehensive daily digest for the founder including:
- System health status
- Secrets health summary
- Integrations map summary
- Compliance audit status
- Growth organism check
- Approval queue count
- Revenue metrics
- Action items
"""

import os
import sys
import json
import logging
import requests
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

OUTPUT_DIR = Path("/home/runner/workspace/workspace-data/autopilot")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(OUTPUT_DIR / "founder_digest.log")
    ]
)
logger = logging.getLogger(__name__)

BACKEND_URL = os.environ.get("NEXT_PUBLIC_API_URL", "http://localhost:8000")


def load_json_file(filepath: Path) -> dict:
    """Load a JSON file safely."""
    try:
        if filepath.exists():
            with open(filepath) as f:
                return json.load(f)
    except Exception as e:
        logger.warning(f"Could not load {filepath}: {e}")
    return {}


def get_health_summary() -> dict:
    """Get backend health summary."""
    try:
        resp = requests.get(f"{BACKEND_URL}/api/health/summary", timeout=10)
        if resp.ok:
            return resp.json()
    except Exception as e:
        logger.warning(f"Could not get health summary: {e}")
    return {"status": "unknown", "error": "Could not reach backend"}


def get_launch_readiness() -> dict:
    """Get launch readiness status."""
    try:
        resp = requests.get(f"{BACKEND_URL}/api/system/launch-readiness", timeout=10)
        if resp.ok:
            return resp.json()
    except Exception as e:
        logger.warning(f"Could not get launch readiness: {e}")
    return {"status": "unknown", "checks_passed": 0, "total_checks": 0}


def get_approval_queue_count() -> int:
    """Get pending approval count."""
    try:
        resp = requests.get(f"{BACKEND_URL}/api/approvals/queue", timeout=10)
        if resp.ok:
            data = resp.json()
            return len(data.get("pending", []))
    except Exception:
        pass
    return 0


def generate_digest() -> str:
    """Generate the founder digest markdown."""
    timestamp = datetime.now(timezone.utc)
    
    secrets_health = load_json_file(OUTPUT_DIR / "secrets_health.json")
    compliance_audit = load_json_file(OUTPUT_DIR / "compliance_audit.json")
    growth_check = load_json_file(OUTPUT_DIR / "growth_check.json")
    integrations_map = load_json_file(OUTPUT_DIR / "integrations_map.json")
    
    health_summary = get_health_summary()
    launch_readiness = get_launch_readiness()
    approval_count = get_approval_queue_count()
    
    digest = f"""# Levqor Founder Digest

**Generated:** {timestamp.strftime('%Y-%m-%d %H:%M:%S UTC')}

---

## Executive Summary

"""
    
    overall_status = "HEALTHY"
    issues = []
    
    secrets_summary = secrets_health.get("summary", {})
    if secrets_summary.get("fail", 0) > 0:
        overall_status = "NEEDS ATTENTION"
        issues.append(f"- {secrets_summary.get('fail', 0)} secrets health check(s) failed")
    
    compliance_summary = compliance_audit.get("summary", {})
    if compliance_summary.get("compliance_score", 100) < 80:
        overall_status = "NEEDS ATTENTION"
        issues.append(f"- Compliance score: {compliance_summary.get('compliance_score', 0)}%")
    
    growth_summary = growth_check.get("summary", {})
    if growth_summary.get("organism_status") != "HEALTHY":
        overall_status = "DEGRADED"
        issues.append(f"- Growth Organism: {growth_summary.get('organism_status', 'UNKNOWN')}")
    
    launch_checks = launch_readiness.get("checks_passed", 0)
    total_checks = launch_readiness.get("total_checks", 7)
    if launch_checks < total_checks:
        overall_status = "NEEDS ATTENTION"
        issues.append(f"- Launch readiness: {launch_checks}/{total_checks} checks passing")
    
    status_emoji = {"HEALTHY": "OK", "NEEDS ATTENTION": "WARN", "DEGRADED": "FAIL", "CRITICAL": "FAIL"}.get(overall_status, "?")
    digest += f"**Overall Status:** [{status_emoji}] {overall_status}\n\n"
    
    if issues:
        digest += "**Issues Requiring Attention:**\n"
        for issue in issues:
            digest += f"{issue}\n"
        digest += "\n"
    else:
        digest += "All systems operational. No critical issues detected.\n\n"
    
    digest += f"""---

## System Health

| Metric | Status |
|--------|--------|
| Backend | {health_summary.get('status', 'unknown').upper()} |
| Launch Readiness | {launch_checks}/{total_checks} checks |
| Pending Approvals | {approval_count} |

"""
    
    digest += """---

## Secrets Health

"""
    if secrets_summary:
        digest += f"""| Status | Count |
|--------|-------|
| OK | {secrets_summary.get('ok', 0)} |
| Warnings | {secrets_summary.get('warn', 0)} |
| Failed | {secrets_summary.get('fail', 0)} |
| Skipped | {secrets_summary.get('skip', 0)} |

"""
        critical_checks = [
            (k, v) for k, v in secrets_health.get("checks", {}).items()
            if v.get("criticality") == "critical"
        ]
        if critical_checks:
            digest += "**Critical Services:**\n"
            for name, data in critical_checks:
                emoji = "OK" if data.get("test_status") == "OK" else "FAIL"
                digest += f"- [{emoji}] {data.get('service', name)}: {data.get('detail', 'N/A')}\n"
            digest += "\n"
    else:
        digest += "*No secrets health data available. Run secrets_health.py first.*\n\n"
    
    digest += """---

## Integrations Map

"""
    if integrations_map.get("integrations"):
        digest += f"**Total Services:** {integrations_map.get('total_services', 0)}\n\n"
        digest += "| Criticality | Count |\n|-------------|-------|\n"
        digest += f"| Critical | {integrations_map.get('critical_count', 0)} |\n"
        digest += f"| High | {integrations_map.get('high_count', 0)} |\n"
        digest += f"| Medium | {integrations_map.get('medium_count', 0)} |\n"
        digest += f"| Low | {integrations_map.get('low_count', 0)} |\n\n"
    else:
        digest += "*No integrations map available.*\n\n"
    
    digest += """---

## Compliance Audit

"""
    if compliance_summary:
        score = compliance_summary.get('compliance_score', 0)
        score_emoji = "OK" if score >= 80 else ("WARN" if score >= 60 else "FAIL")
        digest += f"**Compliance Score:** [{score_emoji}] {score}%\n\n"
        digest += f"| Check Type | Passed | Total |\n|------------|--------|-------|\n"
        digest += f"| Overall | {compliance_summary.get('passed', 0)} | {compliance_summary.get('total_checks', 0)} |\n\n"
        
        failed_pages = [
            p for p in compliance_audit.get("legal_pages", [])
            if p.get("status") == "FAIL" and p.get("required")
        ]
        if failed_pages:
            digest += "**Missing Required Pages:**\n"
            for page in failed_pages:
                digest += f"- {page.get('name')} ({page.get('path')})\n"
            digest += "\n"
    else:
        digest += "*No compliance audit data available. Run compliance_audit.py first.*\n\n"
    
    digest += """---

## Growth Organism

"""
    if growth_summary:
        status = growth_summary.get('organism_status', 'UNKNOWN')
        status_emoji = "OK" if status == "HEALTHY" else "FAIL"
        digest += f"**Organism Status:** [{status_emoji}] {status}\n\n"
        digest += f"| Metric | Value |\n|--------|-------|\n"
        digest += f"| Modules | {growth_summary.get('total_modules', 0)} |\n"
        digest += f"| Imports OK | {growth_summary.get('imports_ok', 0)} |\n"
        digest += f"| Tests OK | {growth_summary.get('tests_ok', 0)} |\n"
        digest += f"| Failed | {growth_summary.get('failed', 0)} |\n\n"
    else:
        digest += "*No growth organism data available. Run growth_organism_check.py first.*\n\n"
    
    digest += """---

## Recommended Actions

"""
    actions = []
    
    if secrets_summary.get("fail", 0) > 0:
        actions.append("1. **URGENT:** Review failed secrets health checks and resolve missing credentials")
    
    if compliance_summary.get("compliance_score", 100) < 80:
        actions.append("2. **HIGH:** Address compliance gaps - review missing legal pages")
    
    if approval_count > 0:
        actions.append(f"3. **MEDIUM:** Review {approval_count} pending approval(s) in the dashboard")
    
    if growth_summary.get("organism_status") != "HEALTHY":
        actions.append("4. **HIGH:** Investigate Growth Organism module failures")
    
    if not actions:
        actions.append("No urgent actions required. System is healthy.")
    
    for action in actions:
        digest += f"{action}\n"
    
    digest += f"""

---

## File Locations

- Secrets Health: `workspace-data/autopilot/secrets_health.json`
- Compliance Audit: `workspace-data/autopilot/compliance_audit.json`
- Growth Check: `workspace-data/autopilot/growth_check.json`
- Integrations Map: `workspace-data/autopilot/integrations_map.json`

---

*This digest was automatically generated by the Guardian Autopilot Grid.*
*Next digest generation: Tomorrow at the same time.*
"""
    
    return digest


def main():
    """Main entry point."""
    logger.info("=" * 60)
    logger.info("GUARDIAN AUTOPILOT - Founder Digest Generator")
    logger.info("=" * 60)
    
    digest = generate_digest()
    
    digest_path = OUTPUT_DIR / "founder_digest.md"
    with open(digest_path, "w") as f:
        f.write(digest)
    
    logger.info(f"Founder Digest saved to: {digest_path}")
    
    print("\n" + "=" * 60)
    print("FOUNDER DIGEST PREVIEW")
    print("=" * 60)
    print(digest[:2000])
    if len(digest) > 2000:
        print("\n... (truncated, see full file)")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
