"""
Levqor V12.12 Enterprise - Reliability & Resiliency Layer
Connection resilience and error handling utilities.
"""

import logging
import time
import uuid
from functools import wraps
from typing import Callable, Any, Optional

log = logging.getLogger("levqor.resilience")


def get_correlation_id() -> str:
    """Generate a unique correlation ID for request tracking."""
    return str(uuid.uuid4())


def log_with_correlation_id(correlation_id: str, level: str, message: str, **kwargs):
    """
    Log a message with correlation ID for distributed tracing.
    
    Args:
        correlation_id: Unique ID for request correlation
        level: Log level (INFO, WARNING, ERROR, CRITICAL)
        message: Log message
        **kwargs: Additional context to log
    """
    log_fn = getattr(log, level.lower(), log.info)
    context = {"correlation_id": correlation_id, **kwargs}
    log_fn(f"{message} | correlation_id={correlation_id} | context={context}")


def retry_on_db_failure(max_attempts: int = 3, backoff_base: float = 0.5):
    """
    Decorator to retry database operations with exponential backoff.
    
    Args:
        max_attempts: Maximum number of retry attempts (default: 3)
        backoff_base: Base delay in seconds for exponential backoff (default: 0.5s)
    
    Usage:
        @retry_on_db_failure(max_attempts=5, backoff_base=1.0)
        def get_user(user_id):
            return db.query(User).filter(User.id == user_id).first()
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            attempt = 0
            last_exception = None
            
            while attempt < max_attempts:
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    attempt += 1
                    last_exception = e
                    
                    # Check if this is a DB connection error
                    error_str = str(e).lower()
                    is_connection_error = any(
                        keyword in error_str
                        for keyword in [
                            "connection",
                            "timeout",
                            "refused",
                            "unavailable",
                            "database",
                            "postgresql"
                        ]
                    )
                    
                    if not is_connection_error:
                        # Not a connection error, don't retry
                        raise
                    
                    if attempt < max_attempts:
                        delay = backoff_base * (2 ** (attempt - 1))
                        log.warning(
                            f"DB connection failed (attempt {attempt}/{max_attempts}): {e}. "
                            f"Retrying in {delay:.2f}s..."
                        )
                        time.sleep(delay)
                    else:
                        log.error(
                            f"DB connection failed after {max_attempts} attempts: {e}"
                        )
                        raise
            
            # Should never reach here, but just in case
            if last_exception:
                raise last_exception
        
        return wrapper
    return decorator


def get_db_session_with_retry(db_factory: Callable, max_attempts: int = 3):
    """
    Get database session with automatic retry on connection failure.
    
    Args:
        db_factory: Function that returns a database session/connection
        max_attempts: Maximum number of retry attempts
    
    Returns:
        Database session object
    
    Example:
        from modules.db_wrapper import get_db
        db = get_db_session_with_retry(get_db, max_attempts=5)
    """
    @retry_on_db_failure(max_attempts=max_attempts)
    def _get_session():
        return db_factory()
    
    return _get_session()


def create_error_response(error: Exception, correlation_id: Optional[str] = None):
    """
    Create a standardized error response with correlation ID.
    
    Args:
        error: The exception that occurred
        correlation_id: Optional correlation ID (generates one if not provided)
    
    Returns:
        Dictionary with error details suitable for JSON response
    """
    if correlation_id is None:
        correlation_id = get_correlation_id()
    
    # Log the full error server-side
    log_with_correlation_id(
        correlation_id,
        "ERROR",
        f"Error occurred: {str(error)}",
        error_type=type(error).__name__,
        error_message=str(error)
    )
    
    # Return sanitized error to client
    return {
        "error": "internal_server_error",
        "message": "An error occurred processing your request",
        "correlation_id": correlation_id,
        "timestamp": time.time()
    }


# Verification commands:
# python -c "from api.utils.resilience import get_correlation_id, log_with_correlation_id; print(get_correlation_id())"
# python -c "from api.utils.resilience import retry_on_db_failure; print('Resilience module loaded successfully')"
