#!/usr/bin/env python3
"""
LEVQOR GUARDIAN LOOP RUNNER — ALWAYS-ON AUTONOMOUS MODE
=========================================================
Runs an infinite loop with safe sleep intervals, executing all Guardian/Autopilot
checks on a rotating schedule. Never crashes permanently.

Usage:
    python3 scripts/autopilot/guardian_loop.py

Environment:
    LEVQOR_LAUNCH_STAGE: 'pre' or 'post' (affects execution behavior)
    GUARDIAN_DRY_RUN: Set to '1' to run in dry-run mode
"""
import os
import sys
import json
import time
import logging
import traceback
import subprocess
from datetime import datetime, timedelta
from pathlib import Path
from threading import Lock

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

AUTOPILOT_DIR = BASE_DIR / "workspace-data" / "autopilot"
LOGS_DIR = AUTOPILOT_DIR / "logs"
LOOP_LOG_FILE = LOGS_DIR / "guardian_loop.log"

LOGS_DIR.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [GUARDIAN-LOOP] %(levelname)s: %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(LOOP_LOG_FILE, encoding='utf-8')
    ]
)
log = logging.getLogger("guardian_loop")

LAUNCH_STAGE = os.environ.get("LEVQOR_LAUNCH_STAGE", "post").lower()
DRY_RUN = os.environ.get("GUARDIAN_DRY_RUN", "0") == "1"

CYCLE_INTERVAL_SEC = 10 * 60  # 10 minutes base cycle

SCHEDULES = {
    "guardian_monitor": {"interval_sec": 10 * 60, "last_run": None, "priority": "high"},
    "secrets_health": {"interval_sec": 6 * 60 * 60, "last_run": None, "priority": "medium"},
    "cost_guard": {"interval_sec": 30 * 60, "last_run": None, "priority": "high"},
    "spike_detector": {"interval_sec": 15 * 60, "last_run": None, "priority": "high"},
    "growth_organism_check": {"interval_sec": 2 * 60 * 60, "last_run": None, "priority": "medium"},
    "compliance_audit": {"interval_sec": 24 * 60 * 60, "last_run": None, "priority": "low"},
    "founder_digest": {"interval_sec": 24 * 60 * 60, "last_run": None, "priority": "low"},
    "onboarding_ux_audit": {"interval_sec": 24 * 60 * 60, "last_run": None, "priority": "low"},
}

SCRIPT_PATHS = {
    "guardian_monitor": "scripts/autopilot/guardian_monitor.py",
    "secrets_health": "scripts/autopilot/secrets_health.py",
    "cost_guard": "scripts/autopilot/cost/cost_guard.py",
    "spike_detector": "scripts/autopilot/cost/spike_detector.py",
    "growth_organism_check": "scripts/autopilot/growth_organism_check.py",
    "compliance_audit": "scripts/autopilot/compliance_audit.py",
    "founder_digest": "scripts/autopilot/founder_digest.py",
    "onboarding_ux_audit": "scripts/autopilot/onboarding_ux_audit.py",
}

alert_lock = Lock()
last_alert_time = {}
ALERT_COOLDOWN_SEC = 15 * 60  # 15 minutes between same alert types


def send_critical_alert(alert_type: str, message: str):
    """Send critical alert via configured channels (rate-limited)."""
    global last_alert_time
    
    with alert_lock:
        now = datetime.utcnow()
        last = last_alert_time.get(alert_type)
        
        if last and (now - last).total_seconds() < ALERT_COOLDOWN_SEC:
            log.debug(f"Alert rate-limited: {alert_type}")
            return
        
        last_alert_time[alert_type] = now
    
    try:
        from monitors.alert_router import send_alert
        
        full_message = f"""
GUARDIAN AUTOPILOT ALERT
========================
Type: {alert_type}
Time: {now.isoformat()}
Stage: {LAUNCH_STAGE.upper()}

{message}

Check Guardian logs: workspace-data/autopilot/logs/guardian_loop.log
"""
        result = send_alert("critical", full_message)
        log.warning(f"Alert sent ({alert_type}): {result}")
    except Exception as e:
        log.error(f"Failed to send alert: {e}")


def run_script(name: str) -> dict:
    """Run a Guardian script and return results."""
    script_path = SCRIPT_PATHS.get(name)
    if not script_path:
        return {"status": "error", "error": f"Unknown script: {name}"}
    
    full_path = BASE_DIR / script_path
    if not full_path.exists():
        return {"status": "error", "error": f"Script not found: {full_path}"}
    
    start_time = time.time()
    
    try:
        result = subprocess.run(
            [sys.executable, str(full_path)],
            capture_output=True,
            text=True,
            timeout=120,
            cwd=str(BASE_DIR),
            env={**os.environ, "PYTHONPATH": str(BASE_DIR)}
        )
        
        duration = time.time() - start_time
        
        output = result.stdout[-2000:] if len(result.stdout) > 2000 else result.stdout
        
        return {
            "status": "ok" if result.returncode == 0 else "failed",
            "return_code": result.returncode,
            "duration_sec": round(duration, 2),
            "output_snippet": output[:500],
            "error": result.stderr[:500] if result.stderr else None
        }
    except subprocess.TimeoutExpired:
        return {"status": "timeout", "error": f"Script timed out after 120s"}
    except Exception as e:
        return {"status": "error", "error": str(e)}


def check_should_run(name: str) -> bool:
    """Check if a script should run based on its schedule."""
    schedule = SCHEDULES.get(name)
    if not schedule:
        return False
    
    last_run = schedule["last_run"]
    if last_run is None:
        return True
    
    interval = schedule["interval_sec"]
    elapsed = (datetime.utcnow() - last_run).total_seconds()
    
    return elapsed >= interval


def analyze_result_for_alerts(name: str, result: dict):
    """Analyze script result and trigger alerts if needed."""
    if result.get("status") == "ok":
        output = result.get("output_snippet", "").lower()
        
        critical_keywords = ["critical failure", "fatal", "crash", "unrecoverable"]
        if any(kw in output for kw in critical_keywords):
            send_critical_alert(
                f"{name}_critical",
                f"Script {name} detected CRITICAL issue:\n{result.get('output_snippet', '')[:300]}"
            )
        return
    
    if result.get("status") in ("failed", "error", "timeout"):
        send_critical_alert(
            f"{name}_failure",
            f"Script {name} failed!\nStatus: {result.get('status')}\nError: {result.get('error', 'Unknown')}"
        )


def run_health_check():
    """Quick health check via HTTP."""
    import requests
    
    backend_url = os.environ.get("BACKEND_URL", "http://localhost:8000")
    
    try:
        resp = requests.get(f"{backend_url}/api/health/summary", timeout=10)
        data = resp.json()
        
        status = data.get("status", "unknown")
        app_up = data.get("app_up", False)
        db_ok = data.get("db_ok", False)
        stripe_ok = data.get("stripe_ok", False)
        
        if not app_up:
            send_critical_alert("backend_down", "Backend application is not responding!")
        
        if not stripe_ok:
            send_critical_alert("stripe_unreachable", "Stripe integration is not healthy!")
        
        return {
            "status": status,
            "app_up": app_up,
            "db_ok": db_ok,
            "stripe_ok": stripe_ok
        }
    except Exception as e:
        send_critical_alert("health_check_failed", f"Health check failed: {e}")
        return {"status": "error", "error": str(e)}


def run_cycle():
    """Run one Guardian cycle."""
    cycle_start = datetime.utcnow()
    log.info("=" * 60)
    log.info(f"GUARDIAN CYCLE START - {cycle_start.isoformat()}")
    log.info(f"Launch Stage: {LAUNCH_STAGE.upper()} | Dry Run: {DRY_RUN}")
    log.info("=" * 60)
    
    results = {}
    
    log.info("Running quick health check...")
    health = run_health_check()
    results["health_check"] = health
    log.info(f"Health: {health.get('status', 'unknown')}")
    
    for name, schedule in SCHEDULES.items():
        if check_should_run(name):
            log.info(f"Running: {name} (interval: {schedule['interval_sec']}s)")
            
            if DRY_RUN:
                log.info(f"  [DRY RUN] Would run {name}")
                result = {"status": "dry_run"}
            else:
                result = run_script(name)
                analyze_result_for_alerts(name, result)
            
            results[name] = result
            schedule["last_run"] = datetime.utcnow()
            
            log.info(f"  Result: {result.get('status', 'unknown')} ({result.get('duration_sec', 0)}s)")
        else:
            last = schedule["last_run"]
            if last:
                next_run = last + timedelta(seconds=schedule["interval_sec"])
                remaining = (next_run - datetime.utcnow()).total_seconds()
                log.debug(f"Skipping {name}: {remaining:.0f}s until next run")
    
    cycle_duration = (datetime.utcnow() - cycle_start).total_seconds()
    
    cycle_summary = {
        "cycle_time": cycle_start.isoformat(),
        "duration_sec": round(cycle_duration, 2),
        "launch_stage": LAUNCH_STAGE,
        "scripts_run": len([r for r in results.values() if r.get("status") != "dry_run"]),
        "results": {k: v.get("status") for k, v in results.items()}
    }
    
    summary_file = AUTOPILOT_DIR / "guardian_cycle_summary.json"
    with open(summary_file, "w") as f:
        json.dump(cycle_summary, f, indent=2)
    
    log.info("=" * 60)
    log.info(f"GUARDIAN CYCLE COMPLETE - Duration: {cycle_duration:.2f}s")
    log.info(f"Scripts run: {cycle_summary['scripts_run']}")
    log.info("=" * 60)
    
    return cycle_summary


def main():
    """Main guardian loop - runs forever."""
    log.info("=" * 60)
    log.info("LEVQOR GUARDIAN LOOP STARTING")
    log.info("=" * 60)
    log.info(f"Launch Stage: {LAUNCH_STAGE}")
    log.info(f"Dry Run Mode: {DRY_RUN}")
    log.info(f"Cycle Interval: {CYCLE_INTERVAL_SEC}s")
    log.info(f"Log File: {LOOP_LOG_FILE}")
    log.info("")
    log.info("Scheduled checks:")
    for name, schedule in SCHEDULES.items():
        interval_min = schedule["interval_sec"] / 60
        log.info(f"  - {name}: every {interval_min:.0f} minutes")
    log.info("")
    log.info("Starting infinite loop... Press Ctrl+C to stop.")
    log.info("=" * 60)
    
    cycle_count = 0
    
    while True:
        try:
            cycle_count += 1
            log.info(f"\n>>> CYCLE #{cycle_count}")
            
            run_cycle()
            
            log.info(f"Sleeping for {CYCLE_INTERVAL_SEC}s until next cycle...")
            time.sleep(CYCLE_INTERVAL_SEC)
            
        except KeyboardInterrupt:
            log.info("\nGuardian loop stopped by user (Ctrl+C)")
            break
        except Exception as e:
            log.error(f"CYCLE ERROR (will retry): {e}")
            log.error(traceback.format_exc())
            
            try:
                send_critical_alert("guardian_loop_error", f"Guardian loop encountered error: {e}")
            except:
                pass
            
            log.info(f"Sleeping for {CYCLE_INTERVAL_SEC}s before retry...")
            time.sleep(CYCLE_INTERVAL_SEC)
    
    log.info("Guardian loop terminated.")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Levqor Guardian Loop Runner")
    parser.add_argument("--once", action="store_true", help="Run one cycle and exit")
    parser.add_argument("--dry-run", action="store_true", help="Dry run mode")
    args = parser.parse_args()
    
    if args.dry_run:
        os.environ["GUARDIAN_DRY_RUN"] = "1"
        DRY_RUN = True
    
    if args.once:
        log.info("Running single cycle (--once mode)")
        summary = run_cycle()
        print(json.dumps(summary, indent=2))
    else:
        main()
