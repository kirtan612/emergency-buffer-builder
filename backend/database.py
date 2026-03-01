"""
Database configuration and session management for Emergency Buffer Builder.

This module sets up the SQLAlchemy async engine, session factory, and provides
database dependency injection for FastAPI routes.
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.pool import NullPool
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/emergency_buffer")

# Convert postgresql:// to postgresql+asyncpg:// for async support
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=True if os.getenv("DEBUG", "False") == "True" else False,
    future=True,
    pool_pre_ping=True,
    poolclass=NullPool,  # Disable connection pooling for development
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Create declarative base for models
Base = declarative_base()


async def get_db() -> AsyncSession:
    """
    Dependency function that provides a database session to FastAPI routes.
    
    Yields:
        AsyncSession: An async SQLAlchemy session
        
    Usage:
        @app.get("/users")
        async def get_users(db: AsyncSession = Depends(get_db)):
            # Use db session here
            pass
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """
    Initialize the database by creating all tables.
    
    This function should be called on application startup to ensure
    all database tables are created based on the defined models.
    
    Note:
        In production, use Alembic migrations instead of this function.
    """
    async with engine.begin() as conn:
        # Import all models here to ensure they are registered with Base
        from models import User, Transaction, EmergencyFund, Insight
        
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
        print("✅ Database tables created successfully")


async def close_db():
    """
    Close all database connections.
    
    This function should be called on application shutdown to properly
    close all database connections and clean up resources.
    """
    await engine.dispose()
    print("✅ Database connections closed")
