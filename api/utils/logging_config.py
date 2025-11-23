"""
Levqor V12.12 Enterprise - Structured Logging Configuration
JSON-formatted logs for production observability and monitoring.
"""

import logging
import json
import sys
from datetime import datetime
from typing import Any, Dict, Optional


class JSONFormatter(logging.Formatter):
    """
    JSON log formatter for structured logging.
    Outputs one JSON object per log line for easy parsing by log aggregators.
    """
    
    def __init__(self, service_name: str = "levqor-backend"):
        super().__init__()
        self.service_name = service_name
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON string."""
        log_data: Dict[str, Any] = {
            "timestamp": datetime.utcfromtimestamp(record.created).isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "service": self.service_name,
        }
        
        # Add correlation ID if available
        if hasattr(record, "correlation_id"):
            log_data["correlation_id"] = record.correlation_id
        
        # Add request details if available
        if hasattr(record, "request_id"):
            log_data["request_id"] = record.request_id
        
        if hasattr(record, "endpoint"):
            log_data["endpoint"] = record.endpoint
        
        if hasattr(record, "method"):
            log_data["method"] = record.method
        
        if hasattr(record, "status_code"):
            log_data["status_code"] = record.status_code
        
        if hasattr(record, "ip_address"):
            log_data["ip_address"] = record.ip_address
        
        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = {
                "type": record.exc_info[0].__name__ if record.exc_info[0] else None,
                "message": str(record.exc_info[1]) if record.exc_info[1] else None,
            }
        
        # Add any extra fields
        if hasattr(record, "extra_data"):
            log_data["extra"] = record.extra_data
        
        return json.dumps(log_data, default=str)


def configure_structured_logging(
    service_name: str = "levqor-backend",
    level: int = logging.INFO,
    enable_json: bool = True
) -> logging.Logger:
    """
    Configure structured JSON logging for the application.
    
    Args:
        service_name: Name of the service (for log aggregation)
        level: Logging level (default: INFO)
        enable_json: Enable JSON formatting (default: True)
    
    Returns:
        Configured root logger
    
    Example:
        logger = configure_structured_logging("levqor-backend", logging.INFO)
        logger.info("Application started")
    """
    root_logger = logging.getLogger()
    root_logger.setLevel(level)
    
    # Remove existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Create console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    
    # Set formatter
    if enable_json:
        formatter = JSONFormatter(service_name)
    else:
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
    
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)
    
    return root_logger


def create_request_logger(
    logger: logging.Logger,
    correlation_id: str,
    endpoint: str,
    method: str,
    ip_address: Optional[str] = None
) -> logging.LoggerAdapter:
    """
    Create a logger adapter with request-specific context.
    
    Args:
        logger: Base logger
        correlation_id: Unique request correlation ID
        endpoint: Request endpoint path
        method: HTTP method
        ip_address: Client IP address (optional)
    
    Returns:
        Logger adapter with request context
    
    Example:
        request_logger = create_request_logger(
            log, 
            correlation_id="abc-123",
            endpoint="/api/users",
            method="POST",
            ip_address="192.168.1.1"
        )
        request_logger.info("Processing user registration")
    """
    extra = {
        "correlation_id": correlation_id,
        "endpoint": endpoint,
        "method": method,
    }
    
    if ip_address:
        extra["ip_address"] = ip_address
    
    return logging.LoggerAdapter(logger, extra)


def log_request_summary(
    logger: logging.Logger,
    correlation_id: str,
    method: str,
    endpoint: str,
    status_code: int,
    duration_ms: float,
    ip_address: Optional[str] = None
):
    """
    Log a request summary with key metrics.
    
    Args:
        logger: Logger instance
        correlation_id: Request correlation ID
        method: HTTP method
        endpoint: Request endpoint
        status_code: Response status code
        duration_ms: Request duration in milliseconds
        ip_address: Client IP (optional)
    """
    extra = {
        "correlation_id": correlation_id,
        "method": method,
        "endpoint": endpoint,
        "status_code": status_code,
        "duration_ms": round(duration_ms, 2),
    }
    
    if ip_address:
        extra["ip_address"] = ip_address
    
    level = logging.INFO
    if status_code >= 500:
        level = logging.ERROR
    elif status_code >= 400:
        level = logging.WARNING
    
    # Create log record with extra fields
    record = logger.makeRecord(
        logger.name,
        level,
        "(unknown file)",
        0,
        f"{method} {endpoint} → {status_code} ({duration_ms:.2f}ms)",
        (),
        None
    )
    
    # Attach extra fields to record
    for key, value in extra.items():
        setattr(record, key, value)
    
    logger.handle(record)


# Verification commands:
# python -c "from api.utils.logging_config import configure_structured_logging; logger = configure_structured_logging(); logger.info('Test log message')"
# python -c "from api.utils.logging_config import JSONFormatter; print('Structured logging module loaded successfully')"
