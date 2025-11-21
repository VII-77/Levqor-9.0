"""
Automated Task Scheduler - APScheduler integration for periodic jobs
"""
import os
import logging
import subprocess
from datetime import datetime

log = logging.getLogger("levqor.scheduler")

def run_intelligence_monitor():
    """Every 15 minutes - Intelligence monitoring cycle"""
    log.info("Running intelligence monitor...")
    try:
        from scripts.automation.intelligence_monitor import run_intelligence_cycle
        run_intelligence_cycle()
        log.info("✅ Intelligence monitor complete")
    except Exception as e:
        log.error(f"Intelligence monitor error: {e}")

def run_weekly_intelligence():
    """Weekly - AI insights and trend analysis"""
    log.info("Running weekly intelligence analysis...")
    try:
        from scripts.automation.intelligence_monitor import run_weekly_analysis
        run_weekly_analysis()
        log.info("✅ Weekly intelligence analysis complete")
    except Exception as e:
        log.error(f"Weekly intelligence error: {e}")

def run_scaling_check():
    """Hourly - Dynamic scaling check"""
    log.debug("Running scaling check...")
    try:
        from modules.autoscale import check_load
        check_load()
    except Exception as e:
        log.error(f"Scaling check error: {e}")

def run_retention_aggregation():
    """Daily retention metrics aggregation"""
    log.info("Running retention aggregation...")
    try:
        result = subprocess.run(
            ["python3", "scripts/aggregate_retention.py"],
            capture_output=True,
            text=True,
            timeout=60
        )
        if result.returncode == 0:
            log.info("✅ Retention aggregation complete")
        else:
            log.error(f"Retention aggregation failed: {result.stderr}")
    except Exception as e:
        log.error(f"Retention aggregation error: {e}")

def run_slo_watchdog():
    """Every 5 minutes SLO check"""
    from monitors.slo_watchdog import get_watchdog
    from monitors.incident_response import get_responder
    
    log.debug("Running SLO watchdog check...")
    try:
        watchdog = get_watchdog()
        result = watchdog.check_slo(p99_latency_ms=50, error_rate=0, availability=1.0)
        
        if result["should_trigger_recovery"]:
            log.warning("SLO breach detected, triggering recovery")
            responder = get_responder()
            responder.recover(error_rate=0.01, recent_failures=5, dry_run=False)
    except Exception as e:
        log.error(f"SLO watchdog error: {e}")

def run_daily_ops_summary():
    """Daily ops summary email"""
    log.info("Running daily ops summary...")
    try:
        result = subprocess.run(
            ["python3", "scripts/ops_summary.py", "--type", "daily"],
            capture_output=True,
            text=True,
            timeout=120
        )
        if result.returncode == 0:
            log.info("✅ Daily ops summary sent")
        else:
            log.error(f"Ops summary failed: {result.stderr}")
    except Exception as e:
        log.error(f"Ops summary error: {e}")

def run_cost_prediction():
    """Weekly cost prediction"""
    log.info("Running cost prediction...")
    try:
        result = subprocess.run(
            ["python3", "scripts/cost_predict.py", "--persist"],
            capture_output=True,
            text=True,
            timeout=60
        )
        if result.returncode == 0:
            log.info("✅ Cost prediction complete")
        else:
            log.error(f"Cost prediction failed: {result.stderr}")
    except Exception as e:
        log.error(f"Cost prediction error: {e}")

def update_kv_costs():
    """Persist cost metrics to KV store (hourly)"""
    import sqlite3
    log.debug("Updating KV cost metrics...")
    
    def _kv_upsert(key, val):
        conn = sqlite3.connect('levqor.db')
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO kv (key, value, updated_at) 
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(key) DO UPDATE SET 
                value = excluded.value,
                updated_at = CURRENT_TIMESTAMP
        """, (key, str(val)))
        conn.commit()
        conn.close()
    
    try:
        from scripts.cost_predict import load_cached_forecast
        forecast = load_cached_forecast()
        
        if forecast:
            breakdown = forecast.get('breakdown', {})
            _kv_upsert('openai_cost_30d', breakdown.get('openai_estimate', 0))
            _kv_upsert('infra_cost_30d', sum(breakdown.get('infra_costs', {}).values()))
            _kv_upsert('stripe_revenue_30d', breakdown.get('stripe_revenue_last_30d', 1))
            log.debug("✅ KV costs updated")
    except Exception as e:
        log.error(f"KV cost update failed: {e}")

def run_growth_retention():
    """Daily growth retention aggregation by source"""
    log.info("Running growth retention aggregation...")
    try:
        result = subprocess.run(
            ["python3", "scripts/aggregate_growth_retention.py"],
            capture_output=True,
            text=True,
            timeout=60
        )
        if result.returncode == 0:
            log.info("✅ Growth retention aggregation complete")
        else:
            log.error(f"Growth retention failed: {result.stderr}")
    except Exception as e:
        log.error(f"Growth retention error: {e}")

def run_governance_report():
    """Weekly governance report email"""
    log.info("Running weekly governance report...")
    try:
        result = subprocess.run(
            ["python3", "scripts/governance_report.py"],
            capture_output=True,
            text=True,
            timeout=120
        )
        if result.returncode == 0:
            log.info("✅ Governance report sent")
        else:
            log.error(f"Governance report failed: {result.stderr}")
    except Exception as e:
        log.error(f"Governance report error: {e}")

def run_health_monitor():
    """Health & uptime monitoring - every 6 hours"""
    log.info("Running health monitor...")
    try:
        result = subprocess.run(
            ["python3", "scripts/automation/health_monitor.py"],
            capture_output=True,
            text=True,
            timeout=60
        )
        if result.returncode == 0:
            log.info("✅ Health check passed")
        else:
            log.warning(f"Health check alerts: {result.stdout}")
    except Exception as e:
        log.error(f"Health monitor error: {e}")

def run_cost_collector():
    """Cost dashboard data collection - daily"""
    log.info("Running cost collector...")
    try:
        result = subprocess.run(
            ["python3", "scripts/automation/cost_collector.py"],
            capture_output=True,
            text=True,
            timeout=60
        )
        if result.returncode == 0:
            log.info("✅ Cost data collected")
        else:
            log.warning(f"Cost collector alerts: {result.stdout}")
    except Exception as e:
        log.error(f"Cost collector error: {e}")

def run_sentry_test():
    """Sentry health check - weekly"""
    log.info("Running Sentry test...")
    try:
        result = subprocess.run(
            ["python3", "scripts/automation/sentry_test.py"],
            capture_output=True,
            text=True,
            timeout=30
        )
        if result.returncode == 0:
            log.info("✅ Sentry test passed")
        else:
            log.error(f"Sentry test failed: {result.stderr}")
    except Exception as e:
        log.error(f"Sentry test error: {e}")

def run_weekly_pulse():
    """Weekly pulse summary - every Friday"""
    log.info("Running weekly pulse...")
    try:
        result = subprocess.run(
            ["python3", "scripts/automation/weekly_pulse.py"],
            capture_output=True,
            text=True,
            timeout=120
        )
        if result.returncode == 0:
            log.info("✅ Weekly pulse sent")
        else:
            log.error(f"Weekly pulse failed: {result.stderr}")
    except Exception as e:
        log.error(f"Weekly pulse error: {e}")

def run_expansion_verifier():
    """Expansion system verification - nightly"""
    log.info("Running expansion verifier...")
    try:
        result = subprocess.run(
            ["python3", "scripts/automation/expansion_verifier.py"],
            capture_output=True,
            text=True,
            timeout=60
        )
        if result.returncode == 0:
            log.info("✅ Expansion verification passed")
        else:
            log.warning(f"Expansion verifier issues: {result.stdout}")
    except Exception as e:
        log.error(f"Expansion verifier error: {e}")

def run_expansion_monitor():
    """Generate expansion monitor report - weekly Friday"""
    log.info("Generating expansion monitor...")
    try:
        result = subprocess.run(
            ["python3", "scripts/automation/generate_expansion_monitor.py"],
            capture_output=True,
            text=True,
            timeout=60
        )
        if result.returncode == 0:
            log.info("✅ Expansion monitor generated")
        else:
            log.error(f"Expansion monitor failed: {result.stderr}")
    except Exception as e:
        log.error(f"Expansion monitor error: {e}")

def run_synthetic_checks():
    """Synthetic endpoint health checks - every 15 min"""
    log.info("Running synthetic checks...")
    try:
        from scripts.monitoring.synthetic_checks import run_synthetic_checks as run_checks
        run_checks()
        log.info("✅ Synthetic checks complete")
    except Exception as e:
        log.error(f"Synthetic checks error: {e}")

def run_alert_checks():
    """Alert threshold monitoring - every 5 min"""
    log.debug("Running alert checks...")
    try:
        from scripts.monitoring.alerting import run_alert_checks as run_alerts
        run_alerts()
    except Exception as e:
        log.error(f"Alert checks error: {e}")

def init_scheduler():
    """Initialize and start APScheduler"""
    try:
        from apscheduler.schedulers.background import BackgroundScheduler
        from apscheduler.triggers.cron import CronTrigger
        
        scheduler = BackgroundScheduler()
        
        scheduler.add_job(
            run_retention_aggregation,
            CronTrigger(hour=0, minute=5, timezone='UTC'),
            id='retention_aggregation',
            name='Daily retention metrics',
            replace_existing=True
        )
        
        scheduler.add_job(
            run_slo_watchdog,
            'interval',
            minutes=5,
            id='slo_watchdog',
            name='SLO monitoring',
            replace_existing=True
        )
        
        scheduler.add_job(
            run_daily_ops_summary,
            CronTrigger(hour=9, minute=0, timezone='Europe/London'),
            id='daily_ops_summary',
            name='Daily ops report',
            replace_existing=True
        )
        
        scheduler.add_job(
            run_cost_prediction,
            CronTrigger(day_of_week='mon', hour=2, minute=10, timezone='UTC'),
            id='cost_prediction',
            name='Weekly cost forecast',
            replace_existing=True
        )
        
        scheduler.add_job(
            update_kv_costs,
            'interval',
            hours=1,
            id='kv_costs',
            name='Hourly KV cost sync',
            replace_existing=True
        )
        
        scheduler.add_job(
            run_growth_retention,
            CronTrigger(hour=0, minute=10, timezone='UTC'),
            id='growth_retention',
            name='Daily growth retention by source',
            replace_existing=True
        )
        
        scheduler.add_job(
            run_governance_report,
            CronTrigger(day_of_week='sun', hour=9, minute=0, timezone='Europe/London'),
            id='governance_report',
            name='Weekly governance email',
            replace_existing=True
        )
        
        scheduler.add_job(
            run_health_monitor,
            'interval',
            hours=6,
            id='health_monitor',
            name='Health & uptime monitor',
            replace_existing=True
        )
        
        scheduler.add_job(
            run_cost_collector,
            CronTrigger(hour=1, minute=0, timezone='UTC'),
            id='cost_collector',
            name='Daily cost dashboard',
            replace_existing=True
        )
        
        scheduler.add_job(
            run_sentry_test,
            CronTrigger(day_of_week='sun', hour=10, minute=0, timezone='UTC'),
            id='sentry_test',
            name='Weekly Sentry health check',
            replace_existing=True
        )
        
        scheduler.add_job(
            run_weekly_pulse,
            CronTrigger(day_of_week='fri', hour=14, minute=0, timezone='Europe/London'),
            id='weekly_pulse',
            name='Weekly pulse summary',
            replace_existing=True
        )
        
        scheduler.add_job(
            run_expansion_verifier,
            CronTrigger(hour=2, minute=0, timezone='UTC'),
            id='expansion_verifier',
            name='Nightly expansion verification',
            replace_existing=True
        )
        
        scheduler.add_job(
            run_expansion_monitor,
            CronTrigger(day_of_week='fri', hour=14, minute=30, timezone='Europe/London'),
            id='expansion_monitor',
            name='Weekly expansion monitor',
            replace_existing=True
        )
        
        scheduler.add_job(
            run_intelligence_monitor,
            'interval',
            minutes=15,
            id='intelligence_monitor',
            name='Intelligence monitoring cycle',
            replace_existing=True
        )
        
        scheduler.add_job(
            run_weekly_intelligence,
            CronTrigger(day_of_week='sun', hour=10, minute=30, timezone='UTC'),
            id='weekly_intelligence',
            name='Weekly AI insights & trends',
            replace_existing=True
        )
        
        scheduler.add_job(
            run_scaling_check,
            'interval',
            hours=1,
            id='scaling_check',
            name='Hourly scaling check',
            replace_existing=True
        )
        
        # Go/No-Go Monitoring (v8.0 Prep)
        scheduler.add_job(
            run_synthetic_checks,
            'interval',
            minutes=15,
            id='synthetic_checks',
            name='Synthetic endpoint checks',
            replace_existing=True
        )
        
        scheduler.add_job(
            run_alert_checks,
            'interval',
            minutes=5,
            id='alert_checks',
            name='Alert threshold checks',
            replace_existing=True
        )
        
        scheduler.start()
        log.info("✅ APScheduler initialized with 18 jobs (including 5 monitoring jobs for Go/No-Go)")
        return scheduler
        
    except ImportError:
        log.warning("APScheduler not installed, automated tasks disabled")
        return None
    except Exception as e:
        log.error(f"Scheduler initialization failed: {e}")
        return None

_scheduler = None

def get_scheduler():
    """Get or initialize scheduler instance"""
    global _scheduler
    if _scheduler is None:
        _scheduler = init_scheduler()
    return _scheduler
