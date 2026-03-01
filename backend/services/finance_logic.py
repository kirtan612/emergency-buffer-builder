"""
Financial calculation logic for Emergency Buffer Builder.

This module provides core financial calculations including insights generation,
spending analysis, trend tracking, and budget checking.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import datetime, timedelta, date
from decimal import Decimal
from typing import Dict, List, Any, Optional
from uuid import UUID

from models import Transaction, EmergencyFund, Insight, User
from .risk_engine import calculate_risk_level, get_risk_message, get_risk_action_items


async def calculate_insights(db: AsyncSession, user_id: UUID) -> Dict[str, Any]:
    """
    Calculate comprehensive financial insights for a user.
    
    This function analyzes the last 30 days of transactions, calculates
    average daily spending, determines survival days, assesses risk level,
    and saves the insights to the database.
    
    Args:
        db: Database session
        user_id: User's unique identifier
        
    Returns:
        Dict containing:
            - avg_daily_spending: Average daily spending (Decimal)
            - survival_days: Days user can survive (Decimal)
            - risk_level: Risk classification (str)
            - emergency_fund: Current fund balance (Decimal)
            - total_30d_spending: Total spending in last 30 days (Decimal)
            
    Algorithm:
        1. Query transactions from last 30 days
        2. Calculate avg_daily_spending = sum(negative amounts) / 30
        3. Get emergency fund balance
        4. Calculate survival_days = fund / avg_daily_spending
        5. Determine risk level based on survival days
        6. Save/update Insight record
        
    Edge Cases:
        - No transactions: avg_daily_spending = 0, survival_days = 999
        - Zero spending: survival_days = 999 (infinite)
        - No emergency fund: survival_days = 0
        
    Example:
        >>> insights = await calculate_insights(db, user_id)
        >>> print(insights['survival_days'])
        15.5
    """
    # Calculate date range (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    # Query transactions from last 30 days
    result = await db.execute(
        select(Transaction).where(
            and_(
                Transaction.user_id == user_id,
                Transaction.date >= thirty_days_ago.date()
            )
        )
    )
    transactions = result.scalars().all()
    
    # Calculate total spending (sum of negative amounts only - expenses)
    total_spending = sum(
        abs(float(tx.amount)) for tx in transactions if tx.amount < 0
    )
    
    # Calculate average daily spending
    avg_daily_spending = Decimal(str(total_spending / 30))
    
    # Get emergency fund balance
    fund_result = await db.execute(
        select(EmergencyFund).where(EmergencyFund.user_id == user_id)
    )
    emergency_fund = fund_result.scalar_one_or_none()
    
    fund_balance = Decimal('0')
    if emergency_fund:
        fund_balance = emergency_fund.total_amount
    
    # Calculate survival days
    if avg_daily_spending == 0:
        survival_days = Decimal('999')  # Infinite (no spending)
    else:
        survival_days = fund_balance / avg_daily_spending
        survival_days = round(survival_days, 1)  # Round to 1 decimal place
    
    # Determine risk level
    risk_level = calculate_risk_level(float(survival_days))
    
    # Save or update Insight record
    insight_result = await db.execute(
        select(Insight).where(Insight.user_id == user_id).order_by(Insight.calculated_at.desc()).limit(1)
    )
    existing_insight = insight_result.scalar_one_or_none()
    
    if existing_insight:
        # Update existing insight
        existing_insight.avg_daily_spending = avg_daily_spending
        existing_insight.survival_days = survival_days
        existing_insight.risk_level = risk_level
        existing_insight.calculated_at = datetime.utcnow()
    else:
        # Create new insight
        new_insight = Insight(
            user_id=user_id,
            avg_daily_spending=avg_daily_spending,
            survival_days=survival_days,
            risk_level=risk_level,
            calculated_at=datetime.utcnow()
        )
        db.add(new_insight)
    
    await db.commit()
    
    # Return insight data
    return {
        "avg_daily_spending": avg_daily_spending,
        "survival_days": survival_days,
        "risk_level": risk_level,
        "emergency_fund": fund_balance,
        "total_30d_spending": Decimal(str(total_spending)),
    }


async def calculate_spending_by_category(
    db: AsyncSession,
    user_id: UUID,
    days: int = 30
) -> List[Dict[str, Any]]:
    """
    Calculate spending breakdown by category.
    
    Groups transactions by category and calculates totals, percentages,
    and transaction counts for the specified time period.
    
    Args:
        db: Database session
        user_id: User's unique identifier
        days: Number of days to analyze (default: 30)
        
    Returns:
        List of dicts, each containing:
            - category: Category name (str)
            - total: Total spending in category (Decimal)
            - percentage: Percentage of total spending (float)
            - transaction_count: Number of transactions (int)
            
        Sorted by total spending (descending)
        
    Example:
        >>> categories = await calculate_spending_by_category(db, user_id, 30)
        >>> print(categories[0])
        {'category': 'food', 'total': 5000, 'percentage': 35.5, 'transaction_count': 45}
    """
    # Calculate date range
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Query transactions (expenses only - negative amounts)
    result = await db.execute(
        select(Transaction).where(
            and_(
                Transaction.user_id == user_id,
                Transaction.date >= start_date.date(),
                Transaction.amount < 0
            )
        )
    )
    transactions = result.scalars().all()
    
    # Group by category
    category_data = {}
    total_spending = Decimal('0')
    
    for tx in transactions:
        category = tx.category
        amount = abs(tx.amount)
        
        if category not in category_data:
            category_data[category] = {
                'category': category,
                'total': Decimal('0'),
                'transaction_count': 0
            }
        
        category_data[category]['total'] += amount
        category_data[category]['transaction_count'] += 1
        total_spending += amount
    
    # Calculate percentages
    result_list = []
    for category, data in category_data.items():
        percentage = float((data['total'] / total_spending * 100)) if total_spending > 0 else 0
        
        result_list.append({
            'category': data['category'],
            'total': data['total'],
            'percentage': round(percentage, 1),
            'transaction_count': data['transaction_count']
        })
    
    # Sort by total descending
    result_list.sort(key=lambda x: x['total'], reverse=True)
    
    return result_list


async def get_spending_trend(
    db: AsyncSession,
    user_id: UUID,
    days: int = 7
) -> List[Dict[str, Any]]:
    """
    Get daily spending totals for trend visualization.
    
    Calculates total spending for each day in the specified period,
    useful for generating spending trend charts.
    
    Args:
        db: Database session
        user_id: User's unique identifier
        days: Number of days to analyze (default: 7)
        
    Returns:
        List of dicts, each containing:
            - date: Date (date object)
            - total: Total spending for that day (Decimal)
            
        Ordered by date (ascending)
        
    Example:
        >>> trend = await get_spending_trend(db, user_id, 7)
        >>> print(trend[0])
        {'date': datetime.date(2024, 2, 18), 'total': 450.50}
    """
    # Calculate date range
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Query transactions (expenses only)
    result = await db.execute(
        select(Transaction).where(
            and_(
                Transaction.user_id == user_id,
                Transaction.date >= start_date.date(),
                Transaction.amount < 0
            )
        ).order_by(Transaction.date)
    )
    transactions = result.scalars().all()
    
    # Group by date
    daily_totals = {}
    
    # Initialize all days with 0
    current_date = start_date.date()
    end_date = datetime.utcnow().date()
    
    while current_date <= end_date:
        daily_totals[current_date] = Decimal('0')
        current_date += timedelta(days=1)
    
    # Sum transactions by date
    for tx in transactions:
        daily_totals[tx.date] = daily_totals.get(tx.date, Decimal('0')) + abs(tx.amount)
    
    # Convert to list format
    trend_data = [
        {'date': date_key, 'total': total}
        for date_key, total in sorted(daily_totals.items())
    ]
    
    return trend_data


async def check_spending_budget(
    user_id: UUID,
    amount: Decimal,
    db: AsyncSession
) -> Dict[str, Any]:
    """
    Check if a spending amount fits within today's remaining budget.
    
    Compares the proposed spending amount against the user's daily budget
    and calculates the impact on survival days.
    
    Args:
        user_id: User's unique identifier
        amount: Proposed spending amount (positive number)
        db: Database session
        
    Returns:
        Dict containing:
            - can_afford: Whether user can afford this (bool)
            - remaining_today: Remaining budget for today (Decimal)
            - daily_budget: Daily budget allocation (Decimal)
            - today_spent: Amount already spent today (Decimal)
            - impact_on_survival_days: Change in survival days (Decimal)
            - new_survival_days: Survival days after this expense (Decimal)
            
    Algorithm:
        1. Get user's monthly allowance
        2. Calculate daily budget = monthly_allowance / 30
        3. Get today's spending so far
        4. Calculate remaining = daily_budget - today_spent
        5. Check if amount <= remaining
        6. Calculate impact on survival days
        
    Example:
        >>> result = await check_spending_budget(user_id, Decimal('500'), db)
        >>> print(result['can_afford'])
        True
        >>> print(result['impact_on_survival_days'])
        -2.5
    """
    # Get user data
    user_result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = user_result.scalar_one_or_none()
    
    if not user:
        raise ValueError("User not found")
    
    # Calculate daily budget
    daily_budget = user.monthly_allowance / Decimal('30')
    
    # Get today's spending
    today = datetime.utcnow().date()
    today_result = await db.execute(
        select(Transaction).where(
            and_(
                Transaction.user_id == user_id,
                Transaction.date == today,
                Transaction.amount < 0
            )
        )
    )
    today_transactions = today_result.scalars().all()
    today_spent = sum(abs(tx.amount) for tx in today_transactions)
    today_spent = Decimal(str(today_spent))
    
    # Calculate remaining budget for today
    remaining_today = daily_budget - today_spent
    
    # Check if can afford
    can_afford = amount <= remaining_today
    
    # Get current insights for survival days calculation
    insights = await calculate_insights(db, user_id)
    current_survival_days = insights['survival_days']
    avg_daily_spending = insights['avg_daily_spending']
    emergency_fund = insights['emergency_fund']
    
    # Calculate impact on survival days
    if avg_daily_spending > 0:
        # Recalculate with new spending
        new_avg_daily = (avg_daily_spending * Decimal('30') + amount) / Decimal('30')
        new_survival_days = emergency_fund / new_avg_daily if new_avg_daily > 0 else Decimal('999')
        new_survival_days = round(new_survival_days, 1)
        impact = new_survival_days - current_survival_days
    else:
        # First expense
        new_survival_days = emergency_fund / (amount / Decimal('30')) if amount > 0 else Decimal('999')
        new_survival_days = round(new_survival_days, 1)
        impact = new_survival_days - current_survival_days
    
    return {
        'can_afford': can_afford,
        'remaining_today': remaining_today,
        'daily_budget': daily_budget,
        'today_spent': today_spent,
        'impact_on_survival_days': impact,
        'new_survival_days': new_survival_days,
        'current_survival_days': current_survival_days,
    }
