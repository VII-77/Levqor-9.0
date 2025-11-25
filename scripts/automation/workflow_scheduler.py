#!/usr/bin/env python3
"""
Workflow Scheduler - MEGA PHASE v18
Runs scheduled workflows based on their schedule_config.

Usage:
    python scripts/automation/workflow_scheduler.py [--once]

This script can be run:
1. As a one-shot execution with --once flag
2. As a continuous loop (default, every 60 seconds)
3. Via external cron (use --once flag)

Example cron entry for every 5 minutes:
    */5 * * * * cd /path/to/levqor && python scripts/automation/workflow_scheduler.py --once
"""
import sys
import os
import time
import logging
import argparse

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from modules.workflows.storage import get_scheduled_workflows, update_workflow
from modules.workflows.runner import WorkflowRunner
from modules.workflows.events import record_workflow_step_event

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
log = logging.getLogger("levqor.scheduler")

CHECK_INTERVAL_SECONDS = 60


def should_run_workflow(workflow) -> bool:
    """Check if a workflow should run based on its schedule_config."""
    if not workflow.schedule_config or not workflow.schedule_config.enabled:
        return False
    
    now = time.time()
    schedule = workflow.schedule_config
    
    if schedule.next_run_at and now < schedule.next_run_at:
        return False
    
    if schedule.last_run_at:
        interval_seconds = schedule.interval_minutes * 60
        if now - schedule.last_run_at < interval_seconds:
            return False
    
    return True


def update_schedule_after_run(workflow):
    """Update the workflow's schedule after a run."""
    now = time.time()
    interval_seconds = workflow.schedule_config.interval_minutes * 60
    
    schedule_update = {
        "enabled": workflow.schedule_config.enabled,
        "interval_minutes": workflow.schedule_config.interval_minutes,
        "cron_expression": workflow.schedule_config.cron_expression,
        "last_run_at": now,
        "next_run_at": now + interval_seconds
    }
    
    update_workflow(workflow.id, {"schedule_config": schedule_update})


def run_scheduled_workflows():
    """Check and run all scheduled workflows that are due."""
    log.info("Checking for scheduled workflows...")
    
    workflows = get_scheduled_workflows()
    log.info(f"Found {len(workflows)} active scheduled workflows")
    
    ran_count = 0
    
    for workflow in workflows:
        try:
            if should_run_workflow(workflow):
                log.info(f"Running scheduled workflow: {workflow.id} ({workflow.name})")
                
                runner = WorkflowRunner(workflow, context={"triggered_by": "scheduler"})
                result = runner.run()
                
                log.info(f"Workflow {workflow.id} completed with status: {result.status}")
                
                update_schedule_after_run(workflow)
                ran_count += 1
                
        except Exception as e:
            log.error(f"Error running workflow {workflow.id}: {e}")
    
    log.info(f"Scheduler cycle complete. Ran {ran_count} workflows.")
    return ran_count


def main():
    parser = argparse.ArgumentParser(description="Levqor Workflow Scheduler")
    parser.add_argument("--once", action="store_true", help="Run once and exit")
    args = parser.parse_args()
    
    log.info("=" * 50)
    log.info("Levqor Workflow Scheduler Starting")
    log.info("=" * 50)
    
    if args.once:
        log.info("Running in one-shot mode")
        run_scheduled_workflows()
        log.info("Scheduler complete (one-shot mode)")
    else:
        log.info(f"Running in continuous mode (interval: {CHECK_INTERVAL_SECONDS}s)")
        try:
            while True:
                run_scheduled_workflows()
                log.info(f"Sleeping for {CHECK_INTERVAL_SECONDS} seconds...")
                time.sleep(CHECK_INTERVAL_SECONDS)
        except KeyboardInterrupt:
            log.info("Scheduler stopped by user")


if __name__ == "__main__":
    main()
