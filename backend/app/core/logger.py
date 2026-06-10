"""
Logging configuration for enterprise application
Structured logging with JSON output and multiple handlers
"""

import logging
import logging.config
import json
from datetime import datetime
from pathlib import Path
from app.core.config import settings

# Create logs directory if it doesn't exist
Path("logs").mkdir(exist_ok=True)

class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging"""
    
    def format(self, record):
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        if hasattr(record, "user_id"):
            log_data["user_id"] = record.user_id
        
        if hasattr(record, "request_id"):
            log_data["request_id"] = record.request_id
        
        return json.dumps(log_data)

def setup_logging():
    """Configure logging for the application"""
    
    logging_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
            },
            "json": {
                "()": JSONFormatter
            }
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "level": settings.LOG_LEVEL,
                "formatter": "json" if settings.LOG_FORMAT == "json" else "default",
                "stream": "ext://sys.stdout"
            },
            "file": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": settings.LOG_LEVEL,
                "formatter": "json" if settings.LOG_FORMAT == "json" else "default",
                "filename": settings.LOG_FILE,
                "maxBytes": 10485760,  # 10MB
                "backupCount": 5
            },
            "error_file": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": "ERROR",
                "formatter": "json" if settings.LOG_FORMAT == "json" else "default",
                "filename": "logs/error.log",
                "maxBytes": 10485760,
                "backupCount": 5
            }
        },
        "loggers": {
            "": {  # root logger
                "level": settings.LOG_LEVEL,
                "handlers": ["console", "file", "error_file"]
            },
            "uvicorn": {
                "level": "INFO",
                "handlers": ["console", "file"],
                "propagate": False
            },
            "uvicorn.access": {
                "level": "INFO",
                "handlers": ["file"],
                "propagate": False
            },
            "sqlalchemy": {
                "level": "WARNING",
                "handlers": ["file"],
                "propagate": False
            }
        }
    }
    
    logging.config.dictConfig(logging_config)
    return logging.getLogger(__name__)

# Initialize logger
logger = setup_logging()

# Convenience function to get logger
def get_logger(name: str) -> logging.Logger:
    """Get logger instance"""
    return logging.getLogger(name)

# Example usage logging functions
def log_user_action(user_id: int, action: str, details: str = None):
    """Log user action"""
    logger = logging.getLogger(__name__)
    logger.info(f"User {user_id} performed action: {action}", extra={"user_id": user_id})
    if details:
        logger.debug(details)

def log_api_call(method: str, endpoint: str, status_code: int, duration_ms: float):
    """Log API call"""
    logger = logging.getLogger(__name__)
    logger.info(f"{method} {endpoint} - {status_code} ({duration_ms}ms)")

def log_database_operation(operation: str, table: str, affected_rows: int):
    """Log database operation"""
    logger = logging.getLogger(__name__)
    logger.debug(f"DB {operation} on {table} - {affected_rows} rows affected")

def log_error(error: Exception, context: str = None):
    """Log error with context"""
    logger = logging.getLogger(__name__)
    if context:
        logger.error(f"Error in {context}: {str(error)}", exc_info=True)
    else:
        logger.error(str(error), exc_info=True)
