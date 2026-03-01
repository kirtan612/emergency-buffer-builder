"""
Dashboard API endpoints for Emergency Buffer Builder.

This module provides comprehensive financial insights and analytics
for the user dashboard with caching support.
"""

from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Dict, Any
import logging

from database import get_db
from models import User, Transaction, EmergencyFund
from schemas import DashboardResponse, TransactionResponse
from auth import get_current_user
from services.finance_logic import calculate_insights, get_spending_trend

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()


@router.get(
    "/",
    response_model=DashboardResponse,
    summary="Get Dashboard Overview",
    description="Get comprehensive financial overview with insights and recent transactions",
    responses={
        200: {"description": "Dashboard data retrieved successfully"},
        401: {"description": "Not authenticated"}
    }
)
async def get_dashboard(
    response: Response,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get comprehensive dashboard insights for the current user.
    
    This endpoint orchestrates multiple data sources to provide
    a complete financial overview including:
    - Average daily spending (last 30 days)
    - Total spending in last 30 days
    - Emergency fund balance
    - Survival days calculation
    - Risk level assessment
    - Recent transactions (last 5)
    - Progress toward 3-month emergency fund goal
    
    Args:
        response: FastAPI response object (for headers)
        db: Database session
        current_user: Authenticated user from JWT token
        
    Returns:
        DashboardResponse: Complete dashboard data
        
    Business Logic:
        1. Calculate financial insights (avg spending, survival days, risk)
        2. Get emergency fund balance
        3. Fetch recent transactions (last 5)
        4. Calculate progress toward 3-month goal
        5. Return comprehensive dashboard data
        
    Caching Recommendation:
        For production, add Cache-Control header:
        - Cache for 5 minutes for better performance
        - Invalidate on transaction/fund changes
        
        Example:
        response.headers["Cache-Control"] = "private, max-age=300"
        
        Or use Redis caching:
        - Key: f"dashboard:{user_id}"
        - TTL: 300 seconds
        - Invalidate on: transaction create/delete, fund deposit/withdraw
        
    Example:
        GET /dashboard
        
        Response:
        {
            "avg_daily_spending": 323.33,
            "total_30d_spending": 9700.00,
            "emergency_fund": 5000.00,
            "survival_days": 15.5,
            "risk_level": "Safe",
            "monthly_allowance": 15000.00,
            "recent_transactions": [...],
            "fund_progress_percent": 17.2
        }
    """
    # Calculate insights
    insights = await calculate_insights(db, current_user.id)
    
    # Get recent transactions (last 5)
    result = await db.execute(
        select(Transaction)
        .where(Transaction.user_id == current_user.id)
        .order_by(desc(Transaction.date), desc(Transaction.created_at))
        .limit(5)
    )
    recent_transactions = result.scalars().all()
    
    # Calculate fund progress percentage (toward 3-month goal)
    # 3-month goal = avg_daily_spending * 90
    avg_daily = float(insights['avg_daily_spending'])
    emergency_fund = float(insights['emergency_fund'])
    
    if avg_daily > 0:
        three_month_goal = avg_daily * 90
        fund_progress_percent = min(100.0, (emergency_fund / three_month_goal) * 100)
    else:
        # No spending yet, consider any fund as 100% progress
        fund_progress_percent = 100.0 if emergency_fund > 0 else 0.0
    
    logger.info(
        f"Dashboard loaded for {current_user.email}: "
        f"{insights['survival_days']:.1f} days ({insights['risk_level']})"
    )
    
    # Cache-Control header suggestion (commented out for now)
    # For production, uncomment to enable caching:
    # response.headers["Cache-Control"] = "private, max-age=300"
    # This caches the response for 5 minutes
    
    # Build dashboard response
    dashboard_data = DashboardResponse(
        avg_daily_spending=insights['avg_daily_spending'],
        total_30d_spending=insights['total_30d_spending'],
        emergency_fund=insights['emergency_fund'],
        survival_days=insights['survival_days'],
        risk_level=insights['risk_level'],
        monthly_allowance=current_user.monthly_allowance,
        recent_transactions=recent_transactions,
        fund_progress_percent=round(fund_progress_percent, 1)
    )
    
    return dashboard_data



@router.get(
    "/trends",
    response_model=List[Dict[str, Any]],
    summary="Get Spending Trends",
    description="Get daily spending totals for trend visualization",
    responses={
        200: {"description": "Spending trends retrieved successfully"},
        401: {"description": "Not authenticated"}
    }
)
async def get_spending_trends(
    days: int = 7,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get daily spending totals for the specified time period.
    
    Returns daily spending data suitable for trend charts and visualizations.
    Useful for showing spending patterns over time.
    
    Args:
        days: Number of days to analyze (default: 7)
        db: Database session
        current_user: Authenticated user from JWT token
        
    Returns:
        List of daily spending data, each containing:
            - date: Date (YYYY-MM-DD)
            - total: Total spending for that day
            
        Ordered by date (ascending)
        
    Business Logic:
        - Only includes expenses (negative amounts)
        - Groups by date
        - Includes days with zero spending
        - Sorted chronologically
        
    Use Cases:
        - Line charts showing spending over time
        - Bar charts for daily comparisons
        - Identifying spending patterns
        - Detecting unusual spending days
        
    Example:
        GET /dashboard/trends?days=7
        
        Response:
        [
            {
                "date": "2024-02-18",
                "total": 450.50
            },
            {
                "date": "2024-02-19",
                "total": 320.00
            },
            {
                "date": "2024-02-20",
                "total": 0.00
            },
            ...
        ]
    """
    # Get spending trend data
    trend_data = await get_spending_trend(db, current_user.id, days)
    
    # Convert date objects to strings for JSON serialization
    trend_response = [
        {
            "date": item['date'].isoformat(),
            "total": float(item['total'])
        }
        for item in trend_data
    ]
    
    logger.info(
        f"User {current_user.email} retrieved spending trends "
        f"for last {days} days"
    )
    
    return trend_response
