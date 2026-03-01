"""
Transaction API endpoints for Emergency Buffer Builder.

This module provides comprehensive CRUD operations for financial transactions
with filtering, pagination, and automatic insight recalculation.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, desc, and_
from typing import Optional, List, Dict, Any
from datetime import date
from uuid import UUID
import logging

from database import get_db
from models import User, Transaction
from schemas import TransactionCreate, TransactionResponse, TransactionList, Message
from auth import get_current_user
from services.finance_logic import calculate_insights, calculate_spending_by_category

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()


@router.get(
    "/",
    response_model=TransactionList,
    summary="Get User Transactions",
    description="Retrieve transactions with filtering and pagination support",
    responses={
        200: {"description": "Transactions retrieved successfully"},
        401: {"description": "Not authenticated"}
    }
)
async def get_transactions(
    limit: int = Query(50, ge=1, le=500, description="Maximum number of transactions"),
    offset: int = Query(0, ge=0, description="Number of transactions to skip"),
    category: Optional[str] = Query(None, description="Filter by category"),
    date_from: Optional[date] = Query(None, description="Filter from date (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="Filter to date (YYYY-MM-DD)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get transactions for the current user with filtering and pagination.
    
    Supports filtering by:
    - Category (food, transport, etc.)
    - Date range (date_from to date_to)
    
    Supports pagination:
    - limit: Number of results per page
    - offset: Number of results to skip
    
    Args:
        limit: Maximum transactions to return (1-500, default: 50)
        offset: Number of transactions to skip (default: 0)
        category: Filter by specific category (optional)
        date_from: Start date for filtering (optional)
        date_to: End date for filtering (optional)
        db: Database session
        current_user: Authenticated user from JWT token
        
    Returns:
        TransactionList: Paginated list with total count
        
    Example:
        GET /transactions?limit=20&offset=0&category=food&date_from=2024-02-01
    """
    # Build query filters
    filters = [Transaction.user_id == current_user.id]
    
    if category:
        filters.append(Transaction.category == category.lower())
    
    if date_from:
        filters.append(Transaction.date >= date_from)
    
    if date_to:
        filters.append(Transaction.date <= date_to)
    
    # Get total count with filters
    count_result = await db.execute(
        select(Transaction).where(and_(*filters))
    )
    all_transactions = count_result.scalars().all()
    total_count = len(all_transactions)
    
    # Get paginated transactions (most recent first)
    result = await db.execute(
        select(Transaction)
        .where(and_(*filters))
        .order_by(desc(Transaction.date), desc(Transaction.created_at))
        .limit(limit)
        .offset(offset)
    )
    transactions = result.scalars().all()
    
    logger.info(
        f"User {current_user.email} retrieved {len(transactions)} transactions "
        f"(total: {total_count}, filters: category={category}, "
        f"date_from={date_from}, date_to={date_to})"
    )
    
    return TransactionList(
        transactions=transactions,
        total_count=total_count
    )



@router.post(
    "/",
    response_model=Dict[str, Any],
    status_code=status.HTTP_201_CREATED,
    summary="Add Transaction",
    description="Create a new transaction and recalculate financial insights",
    responses={
        201: {"description": "Transaction created successfully"},
        401: {"description": "Not authenticated"},
        422: {"description": "Validation error"}
    }
)
async def add_transaction(
    transaction_data: TransactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Add a new transaction for the current user.
    
    This endpoint creates a transaction and automatically recalculates
    financial insights including survival days and risk level.
    
    Args:
        transaction_data: Transaction details (amount, category, description, date)
        db: Database session
        current_user: Authenticated user from JWT token
        
    Returns:
        Dict containing:
            - transaction: Created transaction details
            - updated_survival_days: New survival days after transaction
            - risk_level: Updated risk level
            
    Business Logic:
        1. Create transaction record
        2. Recalculate insights (avg spending, survival days, risk)
        3. Return transaction + updated metrics
        
    Note:
        - Negative amounts = expenses
        - Positive amounts = income
        - Insights recalculated automatically
        
    Example:
        POST /transactions
        {
            "amount": -250.00,
            "category": "food",
            "description": "Lunch",
            "date": "2024-02-25"
        }
        
        Response:
        {
            "transaction": {...},
            "updated_survival_days": 14.5,
            "risk_level": "Safe"
        }
    """
    # Create new transaction
    new_transaction = Transaction(
        user_id=current_user.id,
        amount=transaction_data.amount,
        category=transaction_data.category,
        description=transaction_data.description,
        date=transaction_data.date
    )
    
    db.add(new_transaction)
    await db.commit()
    await db.refresh(new_transaction)
    
    logger.info(
        f"User {current_user.email} added transaction: "
        f"₹{transaction_data.amount} ({transaction_data.category})"
    )
    
    # Recalculate insights after transaction
    try:
        insights = await calculate_insights(db, current_user.id)
        updated_survival_days = float(insights['survival_days'])
        risk_level = insights['risk_level']
        
        logger.info(
            f"Insights recalculated for {current_user.email}: "
            f"{updated_survival_days:.1f} days ({risk_level})"
        )
    except Exception as e:
        logger.error(f"Failed to recalculate insights: {e}")
        # Return transaction even if insight calculation fails
        updated_survival_days = 0.0
        risk_level = "Unknown"
    
    return {
        "transaction": TransactionResponse.model_validate(new_transaction),
        "updated_survival_days": updated_survival_days,
        "risk_level": risk_level
    }



@router.delete(
    "/{transaction_id}",
    response_model=Dict[str, Any],
    summary="Delete Transaction",
    description="Delete a transaction and recalculate insights",
    responses={
        200: {"description": "Transaction deleted successfully"},
        401: {"description": "Not authenticated"},
        403: {"description": "Not authorized to delete this transaction"},
        404: {"description": "Transaction not found"}
    }
)
async def delete_transaction(
    transaction_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a transaction and recalculate financial insights.
    
    This endpoint verifies ownership, deletes the transaction,
    and recalculates survival days and risk level.
    
    Args:
        transaction_id: UUID of the transaction to delete
        db: Database session
        current_user: Authenticated user from JWT token
        
    Returns:
        Dict containing:
            - message: Confirmation message
            - updated_survival_days: New survival days after deletion
            - risk_level: Updated risk level
        
    Raises:
        HTTPException 404: Transaction not found
        HTTPException 403: User doesn't own this transaction
        
    Business Logic:
        1. Verify transaction exists
        2. Verify ownership (403 if not owner, not 404)
        3. Delete transaction
        4. Recalculate insights
        5. Return updated metrics
        
    Security:
        - Returns 404 if transaction doesn't exist
        - Returns 403 if user doesn't own transaction
        - Prevents information leakage
    """
    # Get transaction
    result = await db.execute(
        select(Transaction).where(Transaction.id == transaction_id)
    )
    transaction = result.scalar_one_or_none()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # Verify ownership (403, not 404, to distinguish from not found)
    if transaction.user_id != current_user.id:
        logger.warning(
            f"User {current_user.email} attempted to delete "
            f"transaction {transaction_id} owned by another user"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this transaction"
        )
    
    # Store transaction details for logging
    amount = transaction.amount
    category = transaction.category
    
    # Delete transaction
    await db.execute(
        delete(Transaction).where(Transaction.id == transaction_id)
    )
    await db.commit()
    
    logger.info(
        f"User {current_user.email} deleted transaction: "
        f"₹{amount} ({category})"
    )
    
    # Recalculate insights after deletion
    try:
        insights = await calculate_insights(db, current_user.id)
        updated_survival_days = float(insights['survival_days'])
        risk_level = insights['risk_level']
        
        logger.info(
            f"Insights recalculated after deletion for {current_user.email}: "
            f"{updated_survival_days:.1f} days ({risk_level})"
        )
    except Exception as e:
        logger.error(f"Failed to recalculate insights after deletion: {e}")
        updated_survival_days = 0.0
        risk_level = "Unknown"
    
    return {
        "message": "Transaction deleted successfully",
        "updated_survival_days": updated_survival_days,
        "risk_level": risk_level
    }



@router.get(
    "/categories/summary",
    response_model=List[Dict[str, Any]],
    summary="Get Spending by Category",
    description="Get spending breakdown grouped by category",
    responses={
        200: {"description": "Category summary retrieved successfully"},
        401: {"description": "Not authenticated"}
    }
)
async def get_category_summary(
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get spending breakdown by category for the specified time period.
    
    Returns spending grouped by category with totals, percentages,
    and transaction counts. Sorted by total spending (descending).
    
    Args:
        days: Number of days to analyze (default: 30, max: 365)
        db: Database session
        current_user: Authenticated user from JWT token
        
    Returns:
        List of category summaries, each containing:
            - category: Category name
            - total: Total spending in category
            - percentage: Percentage of total spending
            - transaction_count: Number of transactions
            
    Business Logic:
        - Only includes expenses (negative amounts)
        - Groups by category
        - Calculates totals and percentages
        - Sorts by total (highest first)
        
    Example:
        GET /transactions/categories/summary?days=30
        
        Response:
        [
            {
                "category": "food",
                "total": 4500.00,
                "percentage": 45.0,
                "transaction_count": 30
            },
            {
                "category": "transport",
                "total": 2000.00,
                "percentage": 20.0,
                "transaction_count": 15
            },
            ...
        ]
    """
    # Get spending by category
    category_data = await calculate_spending_by_category(db, current_user.id, days)
    
    logger.info(
        f"User {current_user.email} retrieved category summary "
        f"for last {days} days: {len(category_data)} categories"
    )
    
    return category_data
