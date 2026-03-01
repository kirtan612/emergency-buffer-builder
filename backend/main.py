"""
Main FastAPI application for Emergency Buffer Builder.

This module initializes the FastAPI app, configures middleware, includes routers,
and sets up startup/shutdown events.
"""

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from database import init_db, close_db

# Load environment variables
load_dotenv()

# Application metadata
APP_NAME = os.getenv("APP_NAME", "Emergency Buffer Builder")
APP_VERSION = os.getenv("APP_VERSION", "1.0.0")
APP_DESCRIPTION = """
Emergency Buffer Builder API - Your Financial Safety Net

A production-ready fintech API for students to:
- Track daily expenses across 10 categories
- Build and manage emergency savings
- Calculate survival days in real-time
- Get AI-powered financial advice
- Monitor financial health with risk levels

Built with FastAPI, PostgreSQL, and JWT authentication.
"""


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    
    Startup:
        - Initialize database tables
        
    Shutdown:
        - Close database connections
    """
    # Startup
    print(f"🚀 Starting {APP_NAME} v{APP_VERSION}")
    await init_db()
    print("✅ Application startup complete")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down application...")
    await close_db()
    print("✅ Application shutdown complete")


# Create FastAPI application
app = FastAPI(
    title=APP_NAME,
    description=APP_DESCRIPTION,
    version=APP_VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)


# Configure CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler for unhandled errors.
    
    Args:
        request: The incoming request
        exc: The exception that was raised
        
    Returns:
        JSONResponse with error details
    """
    print(f"❌ Unhandled exception: {exc}")
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal server error",
            "message": str(exc) if os.getenv("DEBUG", "False") == "True" else "An unexpected error occurred",
        },
    )


# Health check endpoint
@app.get(
    "/",
    tags=["Health"],
    summary="Health Check",
    description="Check if the API is running and healthy",
)
async def health_check():
    """
    Health check endpoint to verify API status.
    
    Returns:
        dict: Status information including version
        
    Example:
        GET /
        Response: {"status": "healthy", "version": "1.0.0", "app": "Emergency Buffer Builder"}
    """
    return {
        "status": "healthy",
        "version": APP_VERSION,
        "app": APP_NAME,
    }


# Include routers
from routers import auth, transactions, emergency_fund, dashboard, chatbot, bank_accounts, upi, wallet

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(transactions.router, prefix="/api/v1/transactions", tags=["Transactions"])
app.include_router(emergency_fund.router, prefix="/api/v1/emergency-fund", tags=["Emergency Fund"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(chatbot.router, prefix="/api/v1/chatbot", tags=["Chatbot"])
app.include_router(bank_accounts.router, prefix="/api/v1/bank-accounts", tags=["Bank Accounts"])
app.include_router(upi.router, prefix="/api/v1/upi", tags=["UPI"])
app.include_router(wallet.router, prefix="/api/v1/wallet", tags=["Wallet"])


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if os.getenv("DEBUG", "False") == "True" else False,
    )
