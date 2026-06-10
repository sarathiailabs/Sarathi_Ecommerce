"""
Enterprise Backend Configuration - Production Ready
Version 3.0 - Handles 10M+ orders with multi-tenant support
"""

import os
from typing import Optional, List
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """Application settings with environment-based configuration"""
    
    # ============ API Configuration ============
    API_VERSION: str = "3.0"
    API_TITLE: str = "Prathazon E-Commerce Platform"
    API_DESCRIPTION: str = "Enterprise-grade e-commerce API for 10M+ orders"
    DEBUG: bool = False
    
    # ============ Database Configuration ============
    DATABASE_URL: str = "postgresql+asyncpg://postgres:Manoj1606%40@localhost:5432/prathazon"   
    DATABASE_ECHO: bool = False
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 40
    DATABASE_POOL_PRE_PING: bool = True
    DATABASE_POOL_RECYCLE: int = 3600
    
    # Read Replicas for scaling
    DATABASE_READ_REPLICAS: List[str] = []
    
    # ============ Redis Cache Configuration ============
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_CACHE_TTL: int = 3600
    REDIS_POOL_SIZE: int = 10
    REDIS_MAX_CONNECTIONS: int = 50
    
    # ============ Elasticsearch Configuration ============
    ELASTICSEARCH_URL: str = "http://localhost:9200"
    ELASTICSEARCH_ENABLED: bool = False
    
    # ============ Authentication & Security ============
    JWT_SECRET: str = "super-secret-key-change-in-production-123456"
    JWT_ALGORITHM: str = "HS256"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    JWT_REFRESH_EXPIRATION_DAYS: int = 7
    
    # ============ CORS Configuration ============
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: List[str] = ["*"]
    CORS_ALLOW_HEADERS: List[str] = ["*"]
    
    # ============ File Upload Configuration ============
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIRECTORY: str = "./uploads"
    ALLOWED_EXTENSIONS: List[str] = ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx"]
    
    # ============ Celery Configuration ============
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"
    CELERY_TASK_SERIALIZER: str = "json"
    CELERY_RESULT_SERIALIZER: str = "json"
    CELERY_ACCEPT_CONTENT: List[str] = ["json"]
    CELERY_TIMEZONE: str = "UTC"
    
    # ============ Email Configuration ============
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = "your-email@gmail.com"
    SMTP_PASSWORD: str = "your-app-password"
    SENDER_EMAIL: str = "noreply@prathazon.com"
    
    # ============ SMS Configuration ============
    SMS_PROVIDER: str = "twilio"  # twilio, aws_sns, nexmo
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""
    
    # ============ Payment Gateway Configuration ============
    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    PAYPAL_CLIENT_ID: str = ""
    PAYPAL_CLIENT_SECRET: str = ""
    
    # ============ AWS Configuration ============
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "us-east-1"
    AWS_S3_BUCKET: str = "prathazon-uploads"
    
    # ============ Logging Configuration ============
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"
    LOG_FILE: str = "logs/app.log"
    SENTRY_DSN: Optional[str] = None  # Error tracking
    GEMINI_API_KEY: str = ""
    
    # ============ Monitoring & Performance ============
    PROMETHEUS_ENABLED: bool = True
    JAEGER_ENABLED: bool = False
    JAEGER_AGENT_HOST: str = "localhost"
    JAEGER_AGENT_PORT: int = 6831
    
    # ============ Rate Limiting ============
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_PERIOD_SECONDS: int = 60
    
    # ============ Pagination ============
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100
    
    # ============ Feature Flags ============
    FEATURE_SHOP_OWNER: bool = True
    FEATURE_DELIVERY_MANAGEMENT: bool = True
    FEATURE_MULTI_VENDOR: bool = True
    FEATURE_SUBSCRIPTION: bool = False
    
    # ============ Environment ============
    ENVIRONMENT: str = "development"  # development, staging, production
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()

settings = Settings()
