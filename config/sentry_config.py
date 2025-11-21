"""
Sentry Configuration for Production Error Tracking
"""
import os
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration
from sentry_sdk.integrations.logging import LoggingIntegration

def init_sentry(app=None):
    """
    Initialize Sentry for error tracking and performance monitoring
    
    Args:
        app: Flask app instance (optional, for additional integrations)
    """
    dsn = os.environ.get("SENTRY_DSN")
    
    if not dsn or dsn == "":
        print("⚠️ Sentry DSN not configured - error tracking disabled")
        return False
    
    try:
        sentry_sdk.init(
            dsn=dsn,
            integrations=[
                FlaskIntegration(),
                LoggingIntegration(
                    level=None,  # Capture all logs
                    event_level=None  # Send errors as events
                ),
            ],
            # Performance monitoring
            traces_sample_rate=0.1,  # 10% of transactions
            
            # Set environment
            environment=os.environ.get("ENVIRONMENT", "production"),
            
            # Release tracking
            release=os.environ.get("REPL_SLUG", "levqor@latest"),
            
            # Additional options
            send_default_pii=False,  # Don't send PII
            attach_stacktrace=True,
            debug=False,
        )
        
        print("✅ Sentry initialized successfully")
        return True
        
    except Exception as e:
        print(f"❌ Sentry init failed: {e}")
        return False

def send_test_event():
    """Send a test event to verify Sentry configuration"""
    try:
        sentry_sdk.capture_message(
            "Levqor v7.0 Intelligence - Sentry Test Event",
            level="info"
        )
        print("✅ Sentry test event sent")
        return True
    except Exception as e:
        print(f"❌ Sentry test event failed: {e}")
        return False

def capture_intelligence_error(error: Exception, context: dict = None):
    """
    Capture intelligence layer errors with context
    
    Args:
        error: The exception that occurred
        context: Additional context about the error
    """
    with sentry_sdk.push_scope() as scope:
        scope.set_tag("layer", "intelligence")
        
        if context:
            for key, value in context.items():
                scope.set_context(key, value)
        
        sentry_sdk.capture_exception(error)
