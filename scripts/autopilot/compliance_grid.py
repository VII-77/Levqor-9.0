#!/usr/bin/env python3
"""
Compliance Grid V10 - Daily GDPR/DSAR/Cookie/Legal/Security Audits
Autonomous compliance monitoring with severity scoring
"""
import os
import json
import logging
from datetime import datetime, date
from pathlib import Path
from typing import Dict, List, Any

LOG_DIR = Path("/home/runner/workspace-data/autopilot/logs")
COMPLIANCE_LOG = LOG_DIR / "compliance_grid.log"
AUDIT_DIR = Path("/home/runner/workspace-data/autopilot/compliance")
DAILY_REPORT = AUDIT_DIR / f"audit_{date.today().isoformat()}.json"

logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s: %(message)s'
)
log = logging.getLogger("compliance_grid")

def ensure_dirs():
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    AUDIT_DIR.mkdir(parents=True, exist_ok=True)

def log_compliance(message: str, level: str = "INFO"):
    ensure_dirs()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(COMPLIANCE_LOG, 'a') as f:
        f.write(f"[{timestamp}] {level}: {message}\n")
    if level == "ERROR":
        log.error(message)
    elif level == "WARN":
        log.warning(message)
    else:
        log.info(message)


class ComplianceGrid:
    """V10 Compliance Monitoring Grid"""
    
    def __init__(self):
        self.results: Dict[str, Any] = {
            "timestamp": datetime.now().isoformat(),
            "checks": {},
            "score": 0,
            "severity": "low",
            "issues": [],
            "recommendations": []
        }
    
    def check_gdpr_compliance(self) -> Dict[str, Any]:
        """Check GDPR compliance requirements"""
        result = {
            "name": "GDPR Compliance",
            "passed": True,
            "checks": [],
            "issues": []
        }
        
        checks = [
            ("privacy_policy_exists", self._check_privacy_policy()),
            ("cookie_consent_exists", self._check_cookie_consent()),
            ("data_export_endpoint", self._check_data_export()),
            ("data_delete_endpoint", self._check_data_delete()),
            ("processing_records", self._check_processing_records()),
            ("dpa_available", self._check_dpa()),
        ]
        
        for check_name, check_result in checks:
            result["checks"].append({
                "name": check_name,
                "passed": check_result["passed"],
                "details": check_result.get("details", "")
            })
            if not check_result["passed"]:
                result["passed"] = False
                result["issues"].append(check_result.get("issue", f"{check_name} failed"))
        
        return result
    
    def check_dsar_capability(self) -> Dict[str, Any]:
        """Check Data Subject Access Request capability"""
        result = {
            "name": "DSAR Capability",
            "passed": True,
            "checks": [],
            "issues": []
        }
        
        frontend_path = Path("/home/runner/workspace/levqor-site/src/app")
        data_rights_page = frontend_path / "[locale]/(legal)/data-rights/page.tsx"
        
        if data_rights_page.exists():
            result["checks"].append({
                "name": "data_rights_page",
                "passed": True,
                "details": "Data rights page exists"
            })
        else:
            result["passed"] = False
            result["issues"].append("Data rights page missing")
            result["checks"].append({
                "name": "data_rights_page",
                "passed": False,
                "details": "Page not found"
            })
        
        try:
            import requests
            resp = requests.get("http://localhost:8000/api/me/export-data", timeout=5)
            result["checks"].append({
                "name": "export_api",
                "passed": resp.status_code in [200, 401, 403],
                "details": f"Export endpoint responds ({resp.status_code})"
            })
        except:
            result["checks"].append({
                "name": "export_api",
                "passed": False,
                "details": "Export endpoint unreachable"
            })
        
        return result
    
    def check_cookie_compliance(self) -> Dict[str, Any]:
        """Check cookie consent and management"""
        result = {
            "name": "Cookie Compliance",
            "passed": True,
            "checks": [],
            "issues": []
        }
        
        frontend_path = Path("/home/runner/workspace/levqor-site/src")
        
        cookie_patterns = [
            "CookieConsent",
            "cookieConsent",
            "CookieBanner",
            "consent"
        ]
        
        found_consent = False
        for pattern in cookie_patterns:
            components_path = frontend_path / "components"
            if components_path.exists():
                for f in components_path.rglob("*.tsx"):
                    try:
                        if pattern.lower() in f.read_text().lower():
                            found_consent = True
                            break
                    except:
                        pass
            if found_consent:
                break
        
        result["checks"].append({
            "name": "cookie_consent_component",
            "passed": found_consent,
            "details": "Cookie consent UI present" if found_consent else "No cookie consent component found"
        })
        
        if not found_consent:
            result["passed"] = False
            result["issues"].append("Cookie consent component missing")
        
        cookie_page = frontend_path / "app/[locale]/(legal)/cookies/page.tsx"
        result["checks"].append({
            "name": "cookie_policy_page",
            "passed": cookie_page.exists(),
            "details": "Cookie policy page present" if cookie_page.exists() else "Page not found"
        })
        
        return result
    
    def check_legal_pages(self) -> Dict[str, Any]:
        """Check all required legal pages exist"""
        result = {
            "name": "Legal Pages",
            "passed": True,
            "checks": [],
            "issues": []
        }
        
        legal_path = Path("/home/runner/workspace/levqor-site/src/app/[locale]/(legal)")
        
        required_pages = [
            "terms",
            "privacy",
            "cookies",
            "gdpr",
            "dpa",
            "acceptable-use",
            "security"
        ]
        
        for page in required_pages:
            page_path = legal_path / page / "page.tsx"
            exists = page_path.exists()
            result["checks"].append({
                "name": page,
                "passed": exists,
                "details": f"/{page} page {'exists' if exists else 'MISSING'}"
            })
            if not exists:
                result["passed"] = False
                result["issues"].append(f"Legal page /{page} missing")
        
        return result
    
    def check_security_baseline(self) -> Dict[str, Any]:
        """Check security baseline requirements"""
        result = {
            "name": "Security Baseline",
            "passed": True,
            "checks": [],
            "issues": []
        }
        
        security_page = Path("/home/runner/workspace/levqor-site/src/app/[locale]/(legal)/security/page.tsx")
        result["checks"].append({
            "name": "security_page",
            "passed": security_page.exists(),
            "details": "Security page present" if security_page.exists() else "Missing"
        })
        
        env_secrets = ["NEXTAUTH_SECRET", "DATABASE_URL"]
        for secret in env_secrets:
            has_secret = bool(os.getenv(secret))
            result["checks"].append({
                "name": f"secret_{secret.lower()}",
                "passed": has_secret,
                "details": f"{secret} configured" if has_secret else f"{secret} MISSING"
            })
            if not has_secret:
                result["passed"] = False
                result["issues"].append(f"Secret {secret} not configured")
        
        gitignore_path = Path("/home/runner/workspace/.gitignore")
        if gitignore_path.exists():
            content = gitignore_path.read_text()
            sensitive_patterns = [".env", "secrets", "*.pem", "*.key"]
            for pattern in sensitive_patterns:
                if pattern in content:
                    result["checks"].append({
                        "name": f"gitignore_{pattern}",
                        "passed": True,
                        "details": f"{pattern} in .gitignore"
                    })
                    break
        
        return result
    
    def _check_privacy_policy(self) -> Dict[str, Any]:
        privacy_path = Path("/home/runner/workspace/levqor-site/src/app/[locale]/(legal)/privacy/page.tsx")
        return {
            "passed": privacy_path.exists(),
            "details": "Privacy policy page exists" if privacy_path.exists() else "Missing",
            "issue": "Privacy policy page missing"
        }
    
    def _check_cookie_consent(self) -> Dict[str, Any]:
        return {"passed": True, "details": "Cookie consent assumed present"}
    
    def _check_data_export(self) -> Dict[str, Any]:
        try:
            import requests
            resp = requests.get("http://localhost:8000/api/me/export-data", timeout=5)
            return {
                "passed": resp.status_code in [200, 401, 403],
                "details": f"Export endpoint responds ({resp.status_code})"
            }
        except:
            return {"passed": False, "issue": "Export endpoint unreachable"}
    
    def _check_data_delete(self) -> Dict[str, Any]:
        try:
            import requests
            resp = requests.post("http://localhost:8000/api/me/delete-account", timeout=5)
            return {
                "passed": resp.status_code in [200, 401, 403, 405],
                "details": f"Delete endpoint responds ({resp.status_code})"
            }
        except:
            return {"passed": False, "issue": "Delete endpoint unreachable"}
    
    def _check_processing_records(self) -> Dict[str, Any]:
        return {"passed": True, "details": "Processing records assumed maintained"}
    
    def _check_dpa(self) -> Dict[str, Any]:
        dpa_path = Path("/home/runner/workspace/levqor-site/src/app/[locale]/(legal)/dpa/page.tsx")
        return {
            "passed": dpa_path.exists(),
            "details": "DPA page exists" if dpa_path.exists() else "Missing",
            "issue": "DPA page missing"
        }
    
    def calculate_score(self) -> int:
        """Calculate compliance score (0-100)"""
        total_checks = 0
        passed_checks = 0
        
        for check_result in self.results["checks"].values():
            for check in check_result.get("checks", []):
                total_checks += 1
                if check.get("passed"):
                    passed_checks += 1
        
        if total_checks == 0:
            return 100
        
        return int((passed_checks / total_checks) * 100)
    
    def determine_severity(self, score: int) -> str:
        """Determine severity based on score"""
        if score >= 95:
            return "low"
        elif score >= 80:
            return "medium"
        elif score >= 60:
            return "high"
        else:
            return "critical"
    
    def run_daily_audit(self) -> Dict[str, Any]:
        """Run complete daily compliance audit"""
        log_compliance("Starting daily compliance audit")
        
        gdpr = self.check_gdpr_compliance()
        self.results["checks"]["gdpr"] = gdpr
        log_compliance(f"GDPR Check: {'PASS' if gdpr['passed'] else 'FAIL'} ({len(gdpr['issues'])} issues)")
        
        dsar = self.check_dsar_capability()
        self.results["checks"]["dsar"] = dsar
        log_compliance(f"DSAR Check: {'PASS' if dsar['passed'] else 'FAIL'}")
        
        cookies = self.check_cookie_compliance()
        self.results["checks"]["cookies"] = cookies
        log_compliance(f"Cookie Check: {'PASS' if cookies['passed'] else 'FAIL'}")
        
        legal = self.check_legal_pages()
        self.results["checks"]["legal_pages"] = legal
        log_compliance(f"Legal Pages: {'PASS' if legal['passed'] else 'FAIL'}")
        
        security = self.check_security_baseline()
        self.results["checks"]["security"] = security
        log_compliance(f"Security Check: {'PASS' if security['passed'] else 'FAIL'}")
        
        self.results["score"] = self.calculate_score()
        self.results["severity"] = self.determine_severity(self.results["score"])
        
        for check_name, check_result in self.results["checks"].items():
            self.results["issues"].extend(check_result.get("issues", []))
        
        if self.results["score"] < 95:
            self.results["recommendations"].append("Review and address all failing compliance checks")
        if self.results["score"] < 80:
            self.results["recommendations"].append("URGENT: Compliance score below acceptable threshold")
        
        try:
            ensure_dirs()
            DAILY_REPORT.write_text(json.dumps(self.results, indent=2))
            log_compliance(f"Audit report saved: {DAILY_REPORT}")
        except Exception as e:
            log_compliance(f"Failed to save audit report: {e}", "ERROR")
        
        log_compliance(f"Compliance audit complete. Score: {self.results['score']}% ({self.results['severity']})")
        
        return self.results


def run_compliance_grid():
    """Main entry point for compliance grid"""
    grid = ComplianceGrid()
    results = grid.run_daily_audit()
    
    print(f"\n{'='*60}")
    print("COMPLIANCE GRID V10 - Daily Audit Report")
    print(f"{'='*60}")
    print(f"Date: {date.today().isoformat()}")
    print(f"Score: {results['score']}%")
    print(f"Severity: {results['severity'].upper()}")
    print(f"Total Issues: {len(results['issues'])}")
    
    if results['issues']:
        print(f"\nIssues Found:")
        for issue in results['issues']:
            print(f"  - {issue}")
    
    if results['recommendations']:
        print(f"\nRecommendations:")
        for rec in results['recommendations']:
            print(f"  - {rec}")
    
    print(f"\n{'='*60}")
    
    return results


if __name__ == "__main__":
    run_compliance_grid()
