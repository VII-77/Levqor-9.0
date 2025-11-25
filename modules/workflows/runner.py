"""
Workflow Runner - MEGA PHASE v15
Executes workflow steps with support for http_request, delay, log, and email (Class C)
"""
import time
import json
import logging
import requests
from typing import Dict, Any, Optional
from dataclasses import dataclass, field

from .models import Workflow, WorkflowStep, StepType, RunStatus
from .events import record_workflow_run_start, record_workflow_run_end, record_workflow_step_event

log = logging.getLogger("levqor.workflows.runner")

MAX_DELAY_SECONDS = 300
MAX_HTTP_TIMEOUT = 30
MAX_STEPS_PER_RUN = 50


@dataclass
class RunResult:
    run_id: str
    status: str
    steps_executed: int = 0
    result: Dict[str, Any] = field(default_factory=dict)
    error: Optional[str] = None
    pending_approvals: list = field(default_factory=list)


class WorkflowRunner:
    """Executes workflows step by step with event logging."""
    
    def __init__(self, workflow: Workflow, context: Dict[str, Any] = None):
        self.workflow = workflow
        self.context = context or {}
        self.run_id: str = ""
        self.steps_executed = 0
        self.step_results: Dict[str, Any] = {}
        self.pending_approvals: list = []
    
    def run(self) -> RunResult:
        """Execute the workflow and return results."""
        self.run_id = record_workflow_run_start(self.workflow.id, self.context)
        
        try:
            if not self.workflow.steps:
                record_workflow_run_end(self.run_id, "completed", {"message": "No steps to execute"})
                return RunResult(
                    run_id=self.run_id,
                    status="completed",
                    steps_executed=0,
                    result={"message": "No steps to execute"}
                )
            
            first_step = self.workflow.steps[0]
            self._execute_step_chain(first_step)
            
            final_status = "completed"
            if self.pending_approvals:
                final_status = "pending_approval"
            
            record_workflow_run_end(
                self.run_id,
                final_status,
                result=self.step_results
            )
            
            return RunResult(
                run_id=self.run_id,
                status=final_status,
                steps_executed=self.steps_executed,
                result=self.step_results,
                pending_approvals=self.pending_approvals
            )
            
        except Exception as e:
            error_msg = str(e)
            log.error(f"Workflow run failed: {error_msg}")
            record_workflow_run_end(self.run_id, "failed", error=error_msg)
            
            return RunResult(
                run_id=self.run_id,
                status="failed",
                steps_executed=self.steps_executed,
                error=error_msg
            )
    
    def _execute_step_chain(self, step: WorkflowStep):
        """Execute a step and its successors."""
        if self.steps_executed >= MAX_STEPS_PER_RUN:
            log.warning(f"Max steps ({MAX_STEPS_PER_RUN}) reached for workflow {self.workflow.id}")
            return
        
        step_result = self._execute_single_step(step)
        self.step_results[step.id] = step_result
        self.steps_executed += 1
        
        for next_id in step.next_step_ids:
            next_step = self._find_step(next_id)
            if next_step:
                self._execute_step_chain(next_step)
    
    def _find_step(self, step_id: str) -> Optional[WorkflowStep]:
        """Find a step by ID."""
        for s in self.workflow.steps:
            if s.id == step_id:
                return s
        return None
    
    def _execute_single_step(self, step: WorkflowStep) -> Dict[str, Any]:
        """Execute a single workflow step."""
        record_workflow_step_event(
            self.run_id,
            self.workflow.id,
            step.id,
            "step_started",
            {"step_type": step.type.value if isinstance(step.type, StepType) else step.type}
        )
        
        try:
            step_type = step.type if isinstance(step.type, StepType) else StepType(step.type)
            
            if step_type == StepType.HTTP_REQUEST:
                result = self._execute_http_request(step)
            elif step_type == StepType.DELAY:
                result = self._execute_delay(step)
            elif step_type == StepType.LOG:
                result = self._execute_log(step)
            elif step_type == StepType.EMAIL:
                result = self._execute_email(step)
            elif step_type == StepType.CONDITION:
                result = self._execute_condition(step)
            else:
                result = {"status": "skipped", "reason": f"Unknown step type: {step.type}"}
            
            record_workflow_step_event(
                self.run_id,
                self.workflow.id,
                step.id,
                "step_completed",
                result
            )
            
            return result
            
        except Exception as e:
            error_result = {"status": "error", "error": str(e)}
            record_workflow_step_event(
                self.run_id,
                self.workflow.id,
                step.id,
                "step_failed",
                error_result
            )
            return error_result
    
    def _execute_http_request(self, step: WorkflowStep) -> Dict[str, Any]:
        """Execute an HTTP request step."""
        config = step.config
        method = config.get("method", "GET").upper()
        url = config.get("url", "")
        headers = config.get("headers", {})
        body = config.get("body")
        timeout = min(config.get("timeout", MAX_HTTP_TIMEOUT), MAX_HTTP_TIMEOUT)
        
        if not url:
            return {"status": "error", "error": "No URL specified"}
        
        log.info(f"Executing HTTP {method} to {url}")
        
        try:
            if method == "GET":
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == "POST":
                response = requests.post(url, headers=headers, json=body, timeout=timeout)
            elif method == "PUT":
                response = requests.put(url, headers=headers, json=body, timeout=timeout)
            elif method == "DELETE":
                response = requests.delete(url, headers=headers, timeout=timeout)
            else:
                return {"status": "error", "error": f"Unsupported method: {method}"}
            
            return {
                "status": "success",
                "http_status": response.status_code,
                "response_length": len(response.content),
                "url": url
            }
        except requests.RequestException as e:
            return {"status": "error", "error": str(e), "url": url}
    
    def _execute_delay(self, step: WorkflowStep) -> Dict[str, Any]:
        """Execute a delay step (with safety cap)."""
        config = step.config
        seconds = min(config.get("seconds", 1), MAX_DELAY_SECONDS)
        
        log.info(f"Delaying for {seconds} seconds")
        time.sleep(seconds)
        
        return {"status": "success", "delayed_seconds": seconds}
    
    def _execute_log(self, step: WorkflowStep) -> Dict[str, Any]:
        """Execute a log step."""
        config = step.config
        message = config.get("message", "Log step executed")
        level = config.get("level", "info")
        
        log_func = getattr(log, level, log.info)
        log_func(f"[Workflow Log] {message}")
        
        return {"status": "success", "message": message, "level": level}
    
    def _execute_email(self, step: WorkflowStep) -> Dict[str, Any]:
        """
        Execute an email step (Class C - requires approval).
        Does NOT send real emails in this phase.
        Instead, logs PENDING_EMAIL_SEND event for approval queue.
        """
        config = step.config
        to_email = config.get("to", "")
        subject = config.get("subject", "")
        body = config.get("body", "")
        
        log.info(f"Email step marked as PENDING_EMAIL_SEND (Class C): to={to_email}")
        
        pending_email = {
            "type": "PENDING_EMAIL_SEND",
            "step_id": step.id,
            "to": to_email,
            "subject": subject,
            "body_preview": body[:100] if body else ""
        }
        
        self.pending_approvals.append(pending_email)
        
        record_workflow_step_event(
            self.run_id,
            self.workflow.id,
            step.id,
            "PENDING_EMAIL_SEND",
            pending_email
        )
        
        return {
            "status": "pending_approval",
            "message": "Email requires approval before sending",
            "approval_type": "PENDING_EMAIL_SEND"
        }
    
    def _execute_condition(self, step: WorkflowStep) -> Dict[str, Any]:
        """Execute a condition step (basic implementation)."""
        config = step.config
        condition = config.get("condition", "true")
        
        return {
            "status": "success",
            "condition": condition,
            "result": True
        }


def run_workflow(workflow_id: str, context: Dict[str, Any] = None) -> RunResult:
    """
    Run a workflow by ID.
    Fetches workflow from storage and executes it.
    """
    from .storage import get_workflow_by_id
    
    workflow = get_workflow_by_id(workflow_id)
    if not workflow:
        return RunResult(
            run_id="",
            status="failed",
            error=f"Workflow not found: {workflow_id}"
        )
    
    runner = WorkflowRunner(workflow, context)
    return runner.run()
