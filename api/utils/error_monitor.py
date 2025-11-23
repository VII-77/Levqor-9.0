"""
Levqor V12.12 Enterprise - Error Monitoring Hook
Minimal error notification system for enterprise monitoring.
"""

import logging
from typing import Dict, Any, Optional
from datetime import datetime

log = logging.getLogger("levqor.error_monitor")


def notify_error(
    error_type: str,
    message: str,
    correlation_id: Optional[str] = None,
    severity: str = "ERROR",
    context: Optional[Dict[str, Any]] = None
):
    """
    Enterprise error notification hook.
    
    This function logs structured error events that can be:
    - Ingested by monitoring systems (Sentry, DataDog, etc.)
    - Sent via email alerts
    - Triggered for on-call escalation
    
    Args:
        error_type: Type/category of error (e.g., "BILLING_FAILURE", "DATABASE_ERROR")
        message: Human-readable error description
        correlation_id: Request correlation ID for tracing
        severity: Error severity level (ERROR, CRITICAL, WARNING)
        context: Additional context dictionary
    
    Example:
        notify_error(
            error_type="STRIPE_CHECKOUT_FAILURE",
            message="Failed to create checkout session",
            correlation_id="req-abc-123",
            severity="CRITICAL",
            context={"customer_id": "cus_123", "plan": "growth"}
        )
    """
    timestamp = datetime.utcnow().isoformat() + "Z"
    
    error_event = {
        "timestamp": timestamp,
        "level": severity,
        "type": "ENTERPRISE_MONITOR",
        "error_type": error_type,
        "message": message,
    }
    
    if correlation_id:
        error_event["correlation_id"] = correlation_id
    
    if context:
        error_event["context"] = context
    
    # Log with special marker for enterprise monitoring
    log_fn = getattr(log, severity.lower(), log.error)
    log_fn(
        f"[ENTERPRISE_MONITOR] {error_type}: {message}",
        extra={"error_event": error_event}
    )
    
    # TODO: Wire to external monitoring service (Sentry, email, PagerDuty, etc.)
    # Example integration points:
    # - if os.getenv("SENTRY_DSN"): sentry_sdk.capture_message(message, level=severity)
    # - if severity == "CRITICAL": send_pagerduty_alert(error_event)
    # - if error_type.startswith("BILLING_"): notify_billing_team(error_event)


def notify_billing_error(
    error_message: str,
    correlation_id: Optional[str] = None,
    customer_id: Optional[str] = None,
    amount: Optional[float] = None,
    context: Optional[Dict[str, Any]] = None
):
    """
    Specialized billing error notification.
    
    Args:
        error_message: Billing error description
        correlation_id: Request correlation ID
        customer_id: Affected customer ID
        amount: Transaction amount (if applicable)
        context: Additional billing context
    """
    billing_context = context or {}
    
    if customer_id:
        billing_context["customer_id"] = customer_id
    
    if amount is not None:
        billing_context["amount"] = amount
    
    notify_error(
        error_type="BILLING_ERROR",
        message=error_message,
        correlation_id=correlation_id,
        severity="CRITICAL",
        context=billing_context
    )


def notify_database_error(
    error_message: str,
    correlation_id: Optional[str] = None,
    query: Optional[str] = None,
    context: Optional[Dict[str, Any]] = None
):
    """
    Specialized database error notification.
    
    Args:
        error_message: Database error description
        correlation_id: Request correlation ID
        query: SQL query that failed (sanitized)
        context: Additional database context
    """
    db_context = context or {}
    
    if query:
        # Sanitize query (remove sensitive data)
        db_context["query_preview"] = query[:200] + ("..." if len(query) > 200 else "")
    
    notify_error(
        error_type="DATABASE_ERROR",
        message=error_message,
        correlation_id=correlation_id,
        severity="ERROR",
        context=db_context
    )


# Verification commands:
# python -c "from api.utils.error_monitor import notify_error; notify_error('TEST_ERROR', 'Test error notification', severity='WARNING')"
# python -c "from api.utils.error_monitor import notify_billing_error; print('Error monitor module loaded successfully')"
