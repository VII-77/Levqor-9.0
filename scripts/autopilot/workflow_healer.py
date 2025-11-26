#!/usr/bin/env python3
"""
Autonomous Workflow Healer V10
Auto-detect, diagnose, and repair workflow issues
"""
import os
import json
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional

LOG_DIR = Path("/home/runner/workspace-data/autopilot/logs")
HEALER_LOG = LOG_DIR / "workflow_healer.log"
HEALING_HISTORY = Path("/home/runner/workspace-data/autopilot/healing/history.json")

logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s: %(message)s'
)
log = logging.getLogger("workflow_healer")

def ensure_dirs():
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    HEALING_HISTORY.parent.mkdir(parents=True, exist_ok=True)

def log_healing(message: str, level: str = "INFO"):
    ensure_dirs()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(HEALER_LOG, 'a') as f:
        f.write(f"[{timestamp}] {level}: {message}\n")
    if level == "ERROR":
        log.error(message)
    elif level == "WARN":
        log.warning(message)
    else:
        log.info(message)


class WorkflowIssue:
    """Represents a detected workflow issue"""
    
    def __init__(self, workflow_id: str, step_id: str, issue_type: str, 
                 description: str, severity: str = "medium"):
        self.workflow_id = workflow_id
        self.step_id = step_id
        self.issue_type = issue_type
        self.description = description
        self.severity = severity
        self.detected_at = datetime.now()
        self.auto_fixable = issue_type in [
            "timeout", "retry_limit", "missing_header", 
            "invalid_url_format", "empty_body"
        ]
        self.fix_suggestion = self._generate_fix_suggestion()
    
    def _generate_fix_suggestion(self) -> str:
        suggestions = {
            "timeout": "Increase timeout to 60 seconds and add retry logic",
            "retry_limit": "Reset retry counter and increase retry limit to 5",
            "missing_header": "Add required Content-Type: application/json header",
            "invalid_url_format": "Validate and fix URL format",
            "empty_body": "Add default empty object {} as request body",
            "auth_failure": "Refresh authentication credentials",
            "rate_limited": "Add exponential backoff (initial: 1s, max: 30s)",
            "connection_error": "Verify endpoint availability and network settings",
            "validation_error": "Check input data format and required fields"
        }
        return suggestions.get(self.issue_type, "Review step configuration")
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "workflow_id": self.workflow_id,
            "step_id": self.step_id,
            "issue_type": self.issue_type,
            "description": self.description,
            "severity": self.severity,
            "detected_at": self.detected_at.isoformat(),
            "auto_fixable": self.auto_fixable,
            "fix_suggestion": self.fix_suggestion
        }


class WorkflowHealer:
    """Autonomous Workflow Healing Engine"""
    
    def __init__(self, dry_run: bool = True):
        self.dry_run = dry_run
        self.detected_issues: List[WorkflowIssue] = []
        self.fixes_applied: List[Dict[str, Any]] = []
        self.healing_history: List[Dict[str, Any]] = []
        self._load_history()
    
    def _load_history(self):
        try:
            if HEALING_HISTORY.exists():
                self.healing_history = json.loads(HEALING_HISTORY.read_text())
        except:
            self.healing_history = []
    
    def _save_history(self):
        try:
            ensure_dirs()
            HEALING_HISTORY.write_text(json.dumps(self.healing_history[-100:], indent=2))
        except Exception as e:
            log_healing(f"Failed to save healing history: {e}", "ERROR")
    
    def scan_workflows(self) -> List[Dict[str, Any]]:
        """Scan all workflows for issues"""
        log_healing("Starting workflow health scan")
        
        workflows = []
        
        try:
            import requests
            resp = requests.get("http://localhost:8000/api/workflows", timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                workflows = data.get("workflows", [])
        except Exception as e:
            log_healing(f"Failed to fetch workflows: {e}", "WARN")
            return []
        
        log_healing(f"Found {len(workflows)} workflows to scan")
        return workflows
    
    def detect_issues(self, workflow: Dict[str, Any]) -> List[WorkflowIssue]:
        """Detect issues in a specific workflow"""
        issues = []
        workflow_id = workflow.get("id", "unknown")
        
        for step in workflow.get("steps", []):
            step_id = step.get("id", "unknown")
            step_type = step.get("type", "")
            config = step.get("config", {})
            
            if step_type == "http_request":
                url = config.get("url", "")
                if not url or not (url.startswith("http://") or url.startswith("https://")):
                    issues.append(WorkflowIssue(
                        workflow_id=workflow_id,
                        step_id=step_id,
                        issue_type="invalid_url_format",
                        description=f"Invalid URL format: {url}",
                        severity="high"
                    ))
                
                timeout = config.get("timeout", 30)
                if timeout < 10:
                    issues.append(WorkflowIssue(
                        workflow_id=workflow_id,
                        step_id=step_id,
                        issue_type="timeout",
                        description=f"Timeout too short ({timeout}s)",
                        severity="medium"
                    ))
                
                method = config.get("method", "GET").upper()
                if method in ["POST", "PUT", "PATCH"]:
                    headers = config.get("headers", {})
                    if "Content-Type" not in headers:
                        issues.append(WorkflowIssue(
                            workflow_id=workflow_id,
                            step_id=step_id,
                            issue_type="missing_header",
                            description="Missing Content-Type header for POST/PUT request",
                            severity="low"
                        ))
            
            if step_type == "email":
                to_email = config.get("to", "")
                if not to_email or "@" not in to_email:
                    issues.append(WorkflowIssue(
                        workflow_id=workflow_id,
                        step_id=step_id,
                        issue_type="validation_error",
                        description="Invalid email recipient",
                        severity="high"
                    ))
            
            if step_type == "delay":
                seconds = config.get("seconds", 0)
                if seconds > 3600:
                    issues.append(WorkflowIssue(
                        workflow_id=workflow_id,
                        step_id=step_id,
                        issue_type="timeout",
                        description=f"Delay too long ({seconds}s)",
                        severity="low"
                    ))
        
        return issues
    
    def check_execution_errors(self) -> List[WorkflowIssue]:
        """Check for workflows with recent execution errors"""
        issues = []
        
        try:
            import requests
            resp = requests.get(
                "http://localhost:8000/api/workflows/failed?since=24h",
                timeout=10
            )
            if resp.status_code == 200:
                data = resp.json()
                for failure in data.get("failures", []):
                    issues.append(WorkflowIssue(
                        workflow_id=failure.get("workflow_id", "unknown"),
                        step_id=failure.get("step_id", "unknown"),
                        issue_type=failure.get("error_type", "unknown"),
                        description=failure.get("error_message", "Unknown error"),
                        severity="high"
                    ))
        except:
            pass
        
        return issues
    
    def apply_fix(self, issue: WorkflowIssue) -> bool:
        """Apply auto-fix for an issue"""
        if not issue.auto_fixable:
            log_healing(f"Issue {issue.issue_type} not auto-fixable", "WARN")
            return False
        
        if self.dry_run:
            log_healing(f"[DRY RUN] Would fix: {issue.issue_type} in {issue.workflow_id}/{issue.step_id}")
            return True
        
        try:
            fix_payload = {
                "workflow_id": issue.workflow_id,
                "step_id": issue.step_id,
                "fix_type": issue.issue_type,
                "fix_config": self._get_fix_config(issue)
            }
            
            import requests
            resp = requests.post(
                "http://localhost:8000/api/workflows/apply-fix",
                json=fix_payload,
                timeout=10
            )
            
            if resp.status_code in [200, 201]:
                log_healing(f"Fix applied successfully: {issue.issue_type} in {issue.workflow_id}")
                self.fixes_applied.append({
                    "issue": issue.to_dict(),
                    "applied_at": datetime.now().isoformat(),
                    "success": True
                })
                return True
            else:
                log_healing(f"Fix failed ({resp.status_code}): {issue.issue_type}", "ERROR")
                return False
                
        except Exception as e:
            log_healing(f"Fix exception: {e}", "ERROR")
            return False
    
    def _get_fix_config(self, issue: WorkflowIssue) -> Dict[str, Any]:
        """Generate fix configuration for an issue"""
        configs = {
            "timeout": {"timeout": 60, "retry_count": 3},
            "retry_limit": {"retry_count": 5, "retry_delay": 2},
            "missing_header": {"headers": {"Content-Type": "application/json"}},
            "empty_body": {"body": {}},
            "rate_limited": {"retry_backoff": "exponential", "initial_delay": 1, "max_delay": 30}
        }
        return configs.get(issue.issue_type, {})
    
    def run_healing_cycle(self) -> Dict[str, Any]:
        """Run complete healing cycle"""
        log_healing("="*60)
        log_healing("WORKFLOW HEALER V10 - Starting healing cycle")
        
        self.detected_issues = []
        self.fixes_applied = []
        
        workflows = self.scan_workflows()
        
        for workflow in workflows:
            issues = self.detect_issues(workflow)
            self.detected_issues.extend(issues)
        
        execution_issues = self.check_execution_errors()
        self.detected_issues.extend(execution_issues)
        
        log_healing(f"Detected {len(self.detected_issues)} total issues")
        
        auto_fixable = [i for i in self.detected_issues if i.auto_fixable]
        log_healing(f"Auto-fixable issues: {len(auto_fixable)}")
        
        for issue in auto_fixable:
            self.apply_fix(issue)
        
        results = {
            "timestamp": datetime.now().isoformat(),
            "dry_run": self.dry_run,
            "workflows_scanned": len(workflows),
            "issues_detected": len(self.detected_issues),
            "issues_auto_fixable": len(auto_fixable),
            "fixes_applied": len(self.fixes_applied),
            "issues": [i.to_dict() for i in self.detected_issues],
            "fixes": self.fixes_applied
        }
        
        self.healing_history.append({
            "timestamp": results["timestamp"],
            "issues": results["issues_detected"],
            "fixes": results["fixes_applied"]
        })
        self._save_history()
        
        log_healing(f"Healing cycle complete. Fixed: {len(self.fixes_applied)}/{len(auto_fixable)}")
        log_healing("="*60)
        
        return results


def run_workflow_healer(dry_run: bool = True):
    """Main entry point for workflow healer"""
    healer = WorkflowHealer(dry_run=dry_run)
    results = healer.run_healing_cycle()
    
    print(f"\n{'='*60}")
    print("WORKFLOW HEALER V10 - Healing Report")
    print(f"{'='*60}")
    print(f"Mode: {'DRY RUN' if dry_run else 'LIVE'}")
    print(f"Workflows Scanned: {results['workflows_scanned']}")
    print(f"Issues Detected: {results['issues_detected']}")
    print(f"Auto-Fixable: {results['issues_auto_fixable']}")
    print(f"Fixes Applied: {results['fixes_applied']}")
    
    if results['issues']:
        print(f"\nIssues Found:")
        for issue in results['issues'][:10]:
            status = "FIXABLE" if issue['auto_fixable'] else "MANUAL"
            print(f"  [{status}] {issue['issue_type']}: {issue['description'][:50]}")
    
    print(f"\n{'='*60}")
    
    return results


if __name__ == "__main__":
    import sys
    dry_run = "--live" not in sys.argv
    run_workflow_healer(dry_run=dry_run)
