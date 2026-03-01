"""
Emergency Fund API endpoints for Emergency Buffer Builder.

This module provides endpoints for managing the user's emergency fund
including deposits, withdrawals, and balance queries with lock support.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
from typing import Dict, Any
import logging

from database import get_db
from models import User, EmergencyFund
from schemas import FundDeposit, FundWithdraw, FundResponse, Message
from auth import get_current_user
from services.finance_logic import calculate_insights

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()


@router.get(
    "/",
    response_model=FundResponse,
    summary="Get Emergency Fund",
    description="Retrieve current emergency fund balance and status with survival days",
    responses={
        200: {"description": "Fund details retrieved successfully"},
        401: {"description": "Not authenticated"}
    }
)
async def get_emergency_fund(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get the current user's emergency fund details.
    
    Returns fund balance, lock status, survival days, and risk level.
    
    Args:
        db: Database session
        current_user: Authenticated user from JWT token
        
    Returns:
        FundResponse: Emergency fund balance, lock status, survival days, risk level
        
    Business Logic:
        1. Get emergency fund record (create if doesn't exist)
        2. Calculate insights for survival days and risk level
        3. Return comprehensive fund status
        
    Example:
        GET /emergency-fund
        
        Response:
        {
            "user_id": "uuid",
            "total_amount": 5000.00,
            "locked_until": null,
            "survival_days": 15.5,
            "risk_level": "Safe"
        }
    """
    # Get emergency fund
    result = await db.execute(
        select(EmergencyFund).where(EmergencyFund.user_id == current_user.id)
    )
    fund = result.scalar_one_or_none()
    
    if not fund:
        # Create fund if doesn't exist
        fund = EmergencyFund(
            user_id=current_user.id,
            total_amount=0
        )
        db.add(fund)
        await db.commit()
        await db.refresh(fund)
        logger.info(f"Created emergency fund for user: {current_user.email}")
    
    # Calculate insights for survival days and risk level
    insights = await calculate_insights(db, current_user.id)
    
    # Add calculated fields to response
    fund_response = FundResponse(
        user_id=fund.user_id,
        total_amount=fund.total_amount,
        locked_until=fund.locked_until,
        survival_days=insights['survival_days'],
        risk_level=insights['risk_level']
    )
    
    logger.info(
        f"Fund status for {current_user.email}: "
        f"₹{fund.total_amount} ({insights['survival_days']:.1f} days)"
    )
    
    return fund_response



@router.post(
    "/deposit",
    response_model=FundResponse,
    summary="Deposit to Emergency Fund",
    description="Add money to emergency fund with optional lock period",
    responses={
        200: {"description": "Deposit successful"},
        401: {"description": "Not authenticated"},
        422: {"description": "Validation error"}
    }
)
async def deposit_to_fund(
    deposit_data: FundDeposit,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Deposit money into the emergency fund.
    
    Allows depositing money with an optional lock period to build discipline
    and prevent impulsive withdrawals.
    
    Args:
        deposit_data: Deposit amount and optional lock_days
        db: Database session
        current_user: Authenticated user from JWT token
        
    Returns:
        FundResponse: Updated emergency fund details with new survival days
        
    Business Logic:
        1. Get or create emergency fund
        2. Add deposit amount to total
        3. Set lock period if specified (0-90 days)
        4. Recalculate insights (survival days, risk level)
        5. Return updated fund status
        
    Lock Period:
        - lock_days (0-90): Number of days to lock the fund
        - Locked funds cannot be withdrawn until lock expires
        - New lock extends existing lock if longer
        - Helps build saving discipline
        
    Example:
        POST /emergency-fund/deposit
        {
            "amount": 5000.00,
            "lock_days": 7
        }
        
        Response:
        {
            "user_id": "uuid",
            "total_amount": 10000.00,
            "locked_until": "2024-03-03T10:30:00Z",
            "survival_days": 30.9,
            "risk_level": "Safe"
        }
    """
    # Get or create emergency fund
    result = await db.execute(
        select(EmergencyFund).where(EmergencyFund.user_id == current_user.id)
    )
    fund = result.scalar_one_or_none()
    
    if not fund:
        fund = EmergencyFund(
            user_id=current_user.id,
            total_amount=0
        )
        db.add(fund)
        await db.flush()
        logger.info(f"Created emergency fund for user: {current_user.email}")
    
    # Store old amount for logging
    old_amount = fund.total_amount
    
    # Add deposit amount
    fund.total_amount += deposit_data.amount
    
    # Set lock period if specified
    if deposit_data.lock_days and deposit_data.lock_days > 0:
        lock_until = datetime.utcnow() + timedelta(days=deposit_data.lock_days)
        
        # Extend lock if new lock is longer
        if not fund.locked_until or lock_until > fund.locked_until:
            fund.locked_until = lock_until
            logger.info(
                f"Fund locked for {current_user.email} until "
                f"{lock_until.strftime('%Y-%m-%d')}"
            )
    
    await db.commit()
    await db.refresh(fund)
    
    logger.info(
        f"User {current_user.email} deposited ₹{deposit_data.amount} "
        f"(₹{old_amount} → ₹{fund.total_amount})"
    )
    
    # Recalculate insights
    insights = await calculate_insights(db, current_user.id)
    
    return FundResponse(
        user_id=fund.user_id,
        total_amount=fund.total_amount,
        locked_until=fund.locked_until,
        survival_days=insights['survival_days'],
        risk_level=insights['risk_level']
    )



@router.post(
    "/withdraw",
    response_model=Dict[str, Any],
    summary="Withdraw from Emergency Fund",
    description="Withdraw money from emergency fund (if not locked and sufficient balance)",
    responses={
        200: {"description": "Withdrawal successful"},
        400: {"description": "Insufficient balance"},
        401: {"description": "Not authenticated"},
        403: {"description": "Fund is locked"}
    }
)
async def withdraw_from_fund(
    withdraw_data: FundWithdraw,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Withdraw money from the emergency fund.
    
    Verifies fund is not locked and has sufficient balance before withdrawal.
    Recalculates survival days and risk level after withdrawal.
    
    Args:
        withdraw_data: Withdrawal amount
        db: Database session
        current_user: Authenticated user from JWT token
        
    Returns:
        Dict containing:
            - fund: Updated fund details
            - new_survival_days: Survival days after withdrawal
            - risk_level: Updated risk level
            - message: Confirmation message
        
    Raises:
        HTTPException 404: Emergency fund not found
        HTTPException 403: Fund is locked (cannot withdraw)
        HTTPException 400: Insufficient balance
        
    Business Logic:
        1. Get emergency fund
        2. Check if fund is locked (403 if locked)
        3. Check sufficient balance (400 if insufficient)
        4. Deduct withdrawal amount
        5. Recalculate insights
        6. Return updated fund status with new survival days
        
    Lock Check:
        - If locked_until is set and in the future, withdrawal is blocked
        - Returns 403 with lock expiry date
        - Prevents impulsive withdrawals
        
    Example:
        POST /emergency-fund/withdraw
        {
            "amount": 1000.00
        }
        
        Response:
        {
            "fund": {
                "user_id": "uuid",
                "total_amount": 4000.00,
                "locked_until": null,
                "survival_days": 12.4,
                "risk_level": "Safe"
            },
            "new_survival_days": 12.4,
            "risk_level": "Safe",
            "message": "Withdrawal successful"
        }
        
        Error (Locked):
        {
            "detail": "Fund is locked until 2024-03-03. Cannot withdraw."
        }
        
        Error (Insufficient):
        {
            "detail": "Insufficient balance. Available: ₹500.00"
        }
    """
    # Get emergency fund
    result = await db.execute(
        select(EmergencyFund).where(EmergencyFund.user_id == current_user.id)
    )
    fund = result.scalar_one_or_none()
    
    if not fund:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Emergency fund not found"
        )
    
    # Check if fund is locked (403 Forbidden)
    if fund.locked_until and fund.locked_until > datetime.utcnow():
        days_remaining = (fund.locked_until - datetime.utcnow()).days
        lock_date = fund.locked_until.strftime('%Y-%m-%d')
        
        logger.warning(
            f"User {current_user.email} attempted to withdraw from locked fund "
            f"(locked until {lock_date})"
        )
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Fund is locked until {lock_date}. Cannot withdraw. "
                   f"({days_remaining} days remaining)"
        )
    
    # Check sufficient balance (400 Bad Request)
    if fund.total_amount < withdraw_data.amount:
        logger.warning(
            f"User {current_user.email} attempted to withdraw ₹{withdraw_data.amount} "
            f"but only has ₹{fund.total_amount}"
        )
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient balance. Available: ₹{fund.total_amount:.2f}"
        )
    
    # Store old amount for logging
    old_amount = fund.total_amount
    
    # Withdraw amount
    fund.total_amount -= withdraw_data.amount
    
    await db.commit()
    await db.refresh(fund)
    
    logger.info(
        f"User {current_user.email} withdrew ₹{withdraw_data.amount} "
        f"(₹{old_amount} → ₹{fund.total_amount})"
    )
    
    # Recalculate insights
    insights = await calculate_insights(db, current_user.id)
    
    fund_response = FundResponse(
        user_id=fund.user_id,
        total_amount=fund.total_amount,
        locked_until=fund.locked_until,
        survival_days=insights['survival_days'],
        risk_level=insights['risk_level']
    )
    
    return {
        "fund": fund_response,
        "new_survival_days": float(insights['survival_days']),
        "risk_level": insights['risk_level'],
        "message": "Withdrawal successful"
    }
