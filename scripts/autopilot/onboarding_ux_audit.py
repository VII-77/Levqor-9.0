#!/usr/bin/env python3
"""
Onboarding UX Audit V10 - Daily Onboarding Experience Audit
Checks i18n completeness, CTA clarity, routing, and user journey flow
"""
import os
import json
import logging
from datetime import datetime, date
from pathlib import Path
from typing import Dict, List, Any

LOG_DIR = Path("/home/runner/workspace-data/autopilot/logs")
ONBOARDING_LOG = LOG_DIR / "onboarding_ux_audit.log"
AUDIT_DIR = Path("/home/runner/workspace-data/autopilot/onboarding")
DAILY_REPORT = AUDIT_DIR / f"audit_{date.today().isoformat()}.json"

SUPPORTED_LOCALES = ["en", "es", "fr", "de", "ar", "hi", "zh-Hans", "it", "pt"]

REQUIRED_ONBOARDING_KEYS = [
    "onboarding.newUserHint",
    "onboarding.existingUserHint",
    "onboarding.noAccountHint",
]

REQUIRED_HERO_KEYS = [
    "home.hero.title",
    "home.hero.subtitle",
    "home.hero.description",
    "home.hero.cta_trial",
    "home.hero.cta_pricing",
]

REQUIRED_HEADER_KEYS = [
    "header.home",
    "header.signIn",
    "header.startTrial",
]

logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s: %(message)s'
)
log = logging.getLogger("onboarding_ux_audit")


def ensure_dirs():
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    AUDIT_DIR.mkdir(parents=True, exist_ok=True)


def log_audit(message: str, level: str = "INFO"):
    ensure_dirs()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(ONBOARDING_LOG, 'a') as f:
        f.write(f"[{timestamp}] {level}: {message}\n")
    if level == "ERROR":
        log.error(message)
    elif level == "WARN":
        log.warning(message)
    else:
        log.info(message)


def get_nested_value(data: dict, key_path: str) -> Any:
    """Get nested value from dict using dot notation"""
    keys = key_path.split('.')
    value = data
    for k in keys:
        if isinstance(value, dict) and k in value:
            value = value[k]
        else:
            return None
    return value


class OnboardingUXAudit:
    """V10 Onboarding UX Audit System"""
    
    def __init__(self):
        self.messages_dir = Path("levqor-site/src/messages")
        self.results: Dict[str, Any] = {
            "timestamp": datetime.now().isoformat(),
            "checks": {},
            "score": 0,
            "issues": [],
            "recommendations": [],
            "locale_coverage": {},
            "summary": {}
        }
    
    def check_locale_completeness(self, locale: str) -> Dict[str, Any]:
        """Check if a locale has all required onboarding keys"""
        result = {
            "locale": locale,
            "passed": True,
            "missing_keys": [],
            "present_keys": [],
            "coverage": 0
        }
        
        locale_file = self.messages_dir / f"{locale}.json"
        if not locale_file.exists():
            result["passed"] = False
            result["missing_keys"] = REQUIRED_ONBOARDING_KEYS + REQUIRED_HERO_KEYS + REQUIRED_HEADER_KEYS
            log_audit(f"Missing locale file: {locale}.json", "ERROR")
            return result
        
        try:
            with open(locale_file, 'r', encoding='utf-8') as f:
                messages = json.load(f)
        except json.JSONDecodeError as e:
            result["passed"] = False
            log_audit(f"Invalid JSON in {locale}.json: {e}", "ERROR")
            return result
        
        all_keys = REQUIRED_ONBOARDING_KEYS + REQUIRED_HERO_KEYS + REQUIRED_HEADER_KEYS
        for key in all_keys:
            value = get_nested_value(messages, key)
            if value is not None and value != "":
                result["present_keys"].append(key)
            else:
                result["missing_keys"].append(key)
                result["passed"] = False
        
        result["coverage"] = len(result["present_keys"]) / len(all_keys) * 100
        
        if result["missing_keys"]:
            log_audit(f"[{locale}] Missing keys: {result['missing_keys']}", "WARN")
        else:
            log_audit(f"[{locale}] All onboarding keys present (100% coverage)")
        
        return result
    
    def check_signup_route(self) -> Dict[str, Any]:
        """Check if /signup route exists and redirects properly"""
        result = {
            "name": "Signup Route",
            "passed": False,
            "details": ""
        }
        
        signup_page = Path("levqor-site/src/app/[locale]/(public)/signup/page.tsx")
        if signup_page.exists():
            with open(signup_page, 'r') as f:
                content = f.read()
            if "router.replace" in content or "redirect" in content.lower():
                result["passed"] = True
                result["details"] = "/signup route exists with redirect to trial flow"
                log_audit("Signup route check passed: redirect configured")
            else:
                result["details"] = "/signup route exists but no redirect found"
                log_audit("Signup route exists but missing redirect", "WARN")
        else:
            result["details"] = "/signup route not found"
            log_audit("Signup route not found", "ERROR")
        
        return result
    
    def check_header_cta(self) -> Dict[str, Any]:
        """Check if header has clear CTAs with i18n"""
        result = {
            "name": "Header CTA",
            "passed": False,
            "details": ""
        }
        
        header_file = Path("levqor-site/src/components/Header.tsx")
        if header_file.exists():
            with open(header_file, 'r') as f:
                content = f.read()
            
            has_i18n = "useTranslations" in content
            has_signin_link = "/signin" in content
            has_trial_cta = "startTrial" in content or "start free trial" in content.lower()
            
            if has_i18n and has_signin_link and has_trial_cta:
                result["passed"] = True
                result["details"] = "Header has i18n translations and clear CTAs"
                log_audit("Header CTA check passed")
            else:
                missing = []
                if not has_i18n:
                    missing.append("i18n support")
                if not has_signin_link:
                    missing.append("signin link")
                if not has_trial_cta:
                    missing.append("trial CTA")
                result["details"] = f"Missing: {', '.join(missing)}"
                log_audit(f"Header CTA missing: {missing}", "WARN")
        else:
            result["details"] = "Header component not found"
            log_audit("Header component not found", "ERROR")
        
        return result
    
    def check_homepage_onboarding(self) -> Dict[str, Any]:
        """Check if homepage has onboarding microcopy"""
        result = {
            "name": "Homepage Onboarding",
            "passed": False,
            "details": ""
        }
        
        homepage_file = Path("levqor-site/src/app/[locale]/page.tsx")
        if homepage_file.exists():
            with open(homepage_file, 'r') as f:
                content = f.read()
            
            has_new_user_hint = "onboarding.newUserHint" in content or "newUserHint" in content
            has_existing_user_hint = "onboarding.existingUserHint" in content or "existingUserHint" in content
            has_i18n = "useTranslations" in content
            
            if has_i18n and (has_new_user_hint or has_existing_user_hint):
                result["passed"] = True
                result["details"] = "Homepage has onboarding microcopy with i18n"
                log_audit("Homepage onboarding check passed")
            else:
                result["details"] = "Homepage missing onboarding microcopy"
                log_audit("Homepage missing onboarding microcopy", "WARN")
        else:
            result["details"] = "Homepage not found"
            log_audit("Homepage not found", "ERROR")
        
        return result
    
    def calculate_score(self) -> int:
        """Calculate overall onboarding UX score (0-100)"""
        total_points = 0
        max_points = 0
        
        locale_coverage = sum(
            self.results["locale_coverage"].get(loc, {}).get("coverage", 0)
            for loc in SUPPORTED_LOCALES
        ) / len(SUPPORTED_LOCALES)
        total_points += locale_coverage * 0.5
        max_points += 50
        
        ux_checks = ["signup_route", "header_cta", "homepage_onboarding"]
        for check in ux_checks:
            if self.results["checks"].get(check, {}).get("passed"):
                total_points += 16.67
            max_points += 16.67
        
        return min(100, int(total_points))
    
    def run_full_audit(self) -> Dict[str, Any]:
        """Run complete onboarding UX audit"""
        log_audit("Starting Onboarding UX Audit V10")
        
        for locale in SUPPORTED_LOCALES:
            self.results["locale_coverage"][locale] = self.check_locale_completeness(locale)
        
        self.results["checks"]["signup_route"] = self.check_signup_route()
        self.results["checks"]["header_cta"] = self.check_header_cta()
        self.results["checks"]["homepage_onboarding"] = self.check_homepage_onboarding()
        
        self.results["score"] = self.calculate_score()
        
        passed_locales = sum(
            1 for loc in SUPPORTED_LOCALES
            if self.results["locale_coverage"].get(loc, {}).get("passed")
        )
        
        self.results["summary"] = {
            "total_locales": len(SUPPORTED_LOCALES),
            "passed_locales": passed_locales,
            "locale_coverage_pct": round(passed_locales / len(SUPPORTED_LOCALES) * 100, 1),
            "signup_route_ok": self.results["checks"]["signup_route"]["passed"],
            "header_cta_ok": self.results["checks"]["header_cta"]["passed"],
            "homepage_onboarding_ok": self.results["checks"]["homepage_onboarding"]["passed"],
            "overall_score": self.results["score"]
        }
        
        if self.results["score"] >= 90:
            log_audit(f"Onboarding UX Audit PASSED: {self.results['score']}%")
        elif self.results["score"] >= 70:
            log_audit(f"Onboarding UX Audit WARNING: {self.results['score']}%", "WARN")
        else:
            log_audit(f"Onboarding UX Audit FAILED: {self.results['score']}%", "ERROR")
        
        ensure_dirs()
        with open(DAILY_REPORT, 'w') as f:
            json.dump(self.results, f, indent=2)
        
        return self.results


def run_audit() -> Dict[str, Any]:
    """Entry point for audit"""
    audit = OnboardingUXAudit()
    return audit.run_full_audit()


if __name__ == "__main__":
    results = run_audit()
    print(json.dumps(results["summary"], indent=2))
