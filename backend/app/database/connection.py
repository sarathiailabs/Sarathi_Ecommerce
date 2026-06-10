import random
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.core.config import settings

# Create async engine for writes (Primary)
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DATABASE_ECHO,
    future=True,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    pool_pre_ping=settings.DATABASE_POOL_PRE_PING,
    pool_recycle=settings.DATABASE_POOL_RECYCLE
)

# Async session factory for writes
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
    class_=AsyncSession
)

# Create async engines for read replicas if any are defined
replica_engines = []
for replica_url in settings.DATABASE_READ_REPLICAS:
    rep_engine = create_async_engine(
        replica_url,
        echo=settings.DATABASE_ECHO,
        future=True,
        pool_size=settings.DATABASE_POOL_SIZE,
        max_overflow=settings.DATABASE_MAX_OVERFLOW,
        pool_pre_ping=settings.DATABASE_POOL_PRE_PING,
        pool_recycle=settings.DATABASE_POOL_RECYCLE
    )
    replica_engines.append(rep_engine)

Base = declarative_base()

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency injection to get writer database session for transactional modifications."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def get_read_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency injection to get a reader database session from read replicas.
    Falls back to primary database if no replicas are configured.
    """
    if replica_engines:
        selected_engine = random.choice(replica_engines)
        session_factory = async_sessionmaker(
            bind=selected_engine,
            autocommit=False,
            autoflush=False,
            expire_on_commit=False,
            class_=AsyncSession
        )
    else:
        session_factory = AsyncSessionLocal

    async with session_factory() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db() -> None:
    """Utility function to create database tables if they do not exist."""
    async with engine.begin() as conn:
        from app.models import User, Product, Cart, Order, OrderItem
        await conn.run_sync(Base.metadata.create_all)
