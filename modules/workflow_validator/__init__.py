"""
Workflow Validator Module - V10 Completion
Deep logic validation, guardrails, schema enforcement.
"""
import logging
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from enum import Enum

log = logging.getLogger("levqor.workflow_validator")


class ValidationSeverity(str, Enum):
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"


@dataclass
class ValidationIssue:
    severity: ValidationSeverity
    code: str
    message: str
    step_id: Optional[str] = None
    field: Optional[str] = None
    suggestion: Optional[str] = None


@dataclass
class ValidationResult:
    valid: bool
    issues: List[ValidationIssue] = field(default_factory=list)
    score: int = 100  # 0-100 quality score
    
    def add_error(self, code: str, message: str, step_id: Optional[str] = None, field: Optional[str] = None, suggestion: Optional[str] = None):
        self.issues.append(ValidationIssue(ValidationSeverity.ERROR, code, message, step_id, field, suggestion))
        self.valid = False
        self.score -= 20
    
    def add_warning(self, code: str, message: str, step_id: Optional[str] = None, field: Optional[str] = None, suggestion: Optional[str] = None):
        self.issues.append(ValidationIssue(ValidationSeverity.WARNING, code, message, step_id, field, suggestion))
        self.score -= 5
    
    def add_info(self, code: str, message: str, step_id: Optional[str] = None, field: Optional[str] = None, suggestion: Optional[str] = None):
        self.issues.append(ValidationIssue(ValidationSeverity.INFO, code, message, step_id, field, suggestion))
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "valid": self.valid,
            "score": max(0, self.score),
            "issues": [
                {
                    "severity": i.severity.value,
                    "code": i.code,
                    "message": i.message,
                    "step_id": i.step_id,
                    "field": i.field,
                    "suggestion": i.suggestion
                }
                for i in self.issues
            ],
            "error_count": sum(1 for i in self.issues if i.severity == ValidationSeverity.ERROR),
            "warning_count": sum(1 for i in self.issues if i.severity == ValidationSeverity.WARNING)
        }


VALID_STEP_TYPES = ["log", "http_request", "email", "delay", "condition", "transform", "webhook", "database"]


def validate_workflow(workflow: Dict[str, Any]) -> ValidationResult:
    result = ValidationResult(valid=True)
    
    if not workflow.get("name"):
        result.add_error("MISSING_NAME", "Workflow must have a name", suggestion="Add a descriptive name")
    elif len(workflow.get("name", "")) > 128:
        result.add_warning("NAME_TOO_LONG", "Workflow name exceeds 128 characters", suggestion="Use a shorter name")
    
    steps = workflow.get("steps", [])
    if not steps:
        result.add_error("NO_STEPS", "Workflow must have at least one step", suggestion="Add at least one step")
    elif len(steps) > 50:
        result.add_warning("TOO_MANY_STEPS", f"Workflow has {len(steps)} steps, consider breaking into multiple workflows", suggestion="Split into sub-workflows")
    
    step_ids = set()
    for step in steps:
        step_id = step.get("id", "")
        
        if not step_id:
            result.add_error("MISSING_STEP_ID", "Step missing required ID", suggestion="Add unique step ID")
            continue
        
        if step_id in step_ids:
            result.add_error("DUPLICATE_STEP_ID", f"Duplicate step ID: {step_id}", step_id=step_id, suggestion="Use unique step IDs")
        step_ids.add(step_id)
        
        step_result = validate_step(step, step_ids)
        for issue in step_result.issues:
            result.issues.append(issue)
            if issue.severity == ValidationSeverity.ERROR:
                result.valid = False
                result.score -= 20
            elif issue.severity == ValidationSeverity.WARNING:
                result.score -= 5
    
    validate_step_connections(steps, step_ids, result)
    
    detect_infinite_loops(steps, result)
    
    return result


def validate_step(step: Dict[str, Any], all_step_ids: set) -> ValidationResult:
    result = ValidationResult(valid=True)
    step_id = step.get("id", "unknown")
    step_type = step.get("type", "")
    
    if not step_type:
        result.add_error("MISSING_STEP_TYPE", "Step missing type", step_id=step_id, suggestion="Specify step type")
        return result
    
    if step_type not in VALID_STEP_TYPES:
        result.add_error("INVALID_STEP_TYPE", f"Invalid step type: {step_type}", step_id=step_id, 
                        suggestion=f"Use one of: {', '.join(VALID_STEP_TYPES)}")
    
    config = step.get("config", {})
    
    if step_type == "http_request":
        validate_http_request_step(config, step_id, result)
    elif step_type == "email":
        validate_email_step(config, step_id, result)
    elif step_type == "delay":
        validate_delay_step(config, step_id, result)
    elif step_type == "condition":
        validate_condition_step(config, step_id, result)
    
    return result


def validate_http_request_step(config: Dict[str, Any], step_id: str, result: ValidationResult):
    url = config.get("url", "")
    if not url:
        result.add_error("HTTP_MISSING_URL", "HTTP request missing URL", step_id=step_id, field="url",
                        suggestion="Provide a valid URL")
    elif not url.startswith(("http://", "https://")):
        result.add_error("HTTP_INVALID_URL", "URL must start with http:// or https://", step_id=step_id, field="url")
    elif "localhost" in url or "127.0.0.1" in url:
        result.add_warning("HTTP_LOCALHOST", "URL points to localhost, may not work in production", step_id=step_id, field="url",
                          suggestion="Use a public URL")
    
    method = config.get("method", "GET").upper()
    if method not in ["GET", "POST", "PUT", "PATCH", "DELETE"]:
        result.add_error("HTTP_INVALID_METHOD", f"Invalid HTTP method: {method}", step_id=step_id, field="method")
    
    timeout = config.get("timeout", 30)
    if timeout > 300:
        result.add_warning("HTTP_HIGH_TIMEOUT", f"Timeout {timeout}s is very high", step_id=step_id,
                          suggestion="Consider a shorter timeout")


def validate_email_step(config: Dict[str, Any], step_id: str, result: ValidationResult):
    to_addr = config.get("to", "")
    if not to_addr:
        result.add_error("EMAIL_MISSING_TO", "Email missing recipient", step_id=step_id, field="to",
                        suggestion="Provide recipient email address")
    elif "@" not in to_addr and not to_addr.startswith("{{"):
        result.add_warning("EMAIL_INVALID_TO", "Recipient doesn't look like an email", step_id=step_id, field="to")
    
    subject = config.get("subject", "")
    if not subject:
        result.add_warning("EMAIL_MISSING_SUBJECT", "Email missing subject", step_id=step_id, field="subject",
                          suggestion="Add a subject line")


def validate_delay_step(config: Dict[str, Any], step_id: str, result: ValidationResult):
    seconds = config.get("seconds", 0)
    if seconds <= 0:
        result.add_error("DELAY_INVALID", "Delay must be positive", step_id=step_id, field="seconds")
    elif seconds > 86400:  # 24 hours
        result.add_warning("DELAY_TOO_LONG", f"Delay of {seconds}s is very long", step_id=step_id,
                          suggestion="Consider using scheduled triggers instead")


def validate_condition_step(config: Dict[str, Any], step_id: str, result: ValidationResult):
    condition = config.get("condition", "")
    if not condition:
        result.add_error("CONDITION_MISSING", "Condition step missing expression", step_id=step_id, field="condition",
                        suggestion="Add a condition expression")
    
    true_step = config.get("true_step", "")
    false_step = config.get("false_step", "")
    
    if not true_step and not false_step:
        result.add_warning("CONDITION_NO_BRANCHES", "Condition has no branches defined", step_id=step_id)


def validate_step_connections(steps: List[Dict[str, Any]], step_ids: set, result: ValidationResult):
    for step in steps:
        step_id = step.get("id", "")
        next_steps = step.get("next_step_ids", [])
        
        for next_id in next_steps:
            if next_id and next_id not in step_ids:
                result.add_error("INVALID_NEXT_STEP", f"Step {step_id} references non-existent step {next_id}",
                               step_id=step_id, suggestion="Fix step reference")


def detect_infinite_loops(steps: List[Dict[str, Any]], result: ValidationResult):
    step_map = {s.get("id"): s for s in steps}
    
    for step in steps:
        step_id = step.get("id", "")
        visited = set()
        
        def check_path(current_id: str, path: List[str]) -> bool:
            if current_id in visited:
                return True  # Loop detected
            if current_id not in step_map:
                return False
            
            visited.add(current_id)
            current_step = step_map[current_id]
            next_steps = current_step.get("next_step_ids", [])
            
            for next_id in next_steps:
                if check_path(next_id, path + [current_id]):
                    return True
            
            return False
        
        if check_path(step_id, []):
            result.add_warning("POTENTIAL_LOOP", f"Potential infinite loop detected starting from {step_id}",
                              step_id=step_id, suggestion="Review workflow logic")
            break


def lint_workflow(workflow: Dict[str, Any]) -> Dict[str, Any]:
    result = validate_workflow(workflow)
    
    linting_suggestions = []
    
    steps = workflow.get("steps", [])
    if steps and not steps[-1].get("next_step_ids"):
        linting_suggestions.append({
            "type": "best_practice",
            "message": "Consider adding a final 'log' step to confirm workflow completion"
        })
    
    has_error_handling = any("error" in str(s.get("config", {})).lower() for s in steps)
    if not has_error_handling:
        linting_suggestions.append({
            "type": "reliability",
            "message": "Consider adding error handling steps"
        })
    
    return {
        **result.to_dict(),
        "linting_suggestions": linting_suggestions
    }
