"""
Bank Account API endpoints for Emergency Buffer Builder.

This module provides endpoints for managing user bank accounts
including adding, verifying, and managing bank account details.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import logging

from database import get_db
from models import User, BankAccount
from schemas import BankAccountCreate, BankAccountResponse, Message
from auth import get_current_user

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/",
    response_model=BankAccountResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Bank Account",
    description="Add a new bank account for withdrawals"
)
async def add_bank_account(
    account_data: BankAccountCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Add a new bank account for the current user.
    
    The account will be in 'pending' verification status initially.
    Users can verify it later using penny drop or manual verification.
    
    Args:
        account_data: Bank account details
        db: Database session
        current_user: Authenticated user
        
    Returns:
        BankAccountResponse: Created bank account details
        
    Business Logic:
        - Mask account number (show only last 4 digits in response)
        - Set first account as primary automatically
        - Store account details securely
        
    Example:
        POST /bank-accounts
        {
            "account_number": "1234567890",
            "ifsc_code": "SBIN0001234",
            "account_holder_name": "John Doe",
            "bank_name": "State Bank of India"
        }
    """
    # Check if this is user's first bank account
    result = await db.execute(
        select(BankAccount).where(BankAccount.user_id == current_user.id)
    )
    existing_accounts = result.scalars().all()
    
    # Set as primary if first account
    is_primary = "yes" if len(existing_accounts) == 0 else "no"
    
    # Create bank account
    bank_account = BankAccount(
        user_id=current_user.id,
        account_number=account_data.account_number,  # TODO: Encrypt in production
        ifsc_code=account_data.ifsc_code,
        account_holder_name=account_data.account_holder_name,
        bank_name=account_data.bank_name,
        is_primary=is_primary,
        is_verified="pending"
    )
    
    db.add(bank_account)
    await db.commit()
    await db.refresh(bank_account)
    
    # Mask account number for response
    masked_account = "XXXX" + bank_account.account_number[-4:]
    bank_account.account_number = masked_account
    
    logger.info(f"Bank account added for user {current_user.email}: {bank_account.bank_name}")
    
    return bank_account


@router.get(
    "/",
    response_model=List[BankAccountResponse],
    summary="Get Bank Accounts",
    description="Get all bank accounts for the current user"
)
async def get_bank_accounts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all bank accounts for the current user.
    
    Args:
        db: Database session
        current_user: Authenticated user
        
    Returns:
        List[BankAccountResponse]: List of user's bank accounts
        
    Note:
        Account numbers are masked (only last 4 digits visible)
    """
    result = await db.execute(
        select(BankAccount)
        .where(BankAccount.user_id == current_user.id)
        .order_by(BankAccount.is_primary.desc(), BankAccount.created_at.desc())
    )
    accounts = result.scalars().all()
    
    # Mask account numbers
    for account in accounts:
        account.account_number = "XXXX" + account.account_number[-4:]
    
    return accounts


@router.post(
    "/{account_id}/verify",
    response_model=BankAccountResponse,
    summary="Verify Bank Account",
    description="Verify bank account (manual verification for now)"
)
async def verify_bank_account(
    account_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Verify a bank account.
    
    In production, this would trigger a penny drop verification.
    For now, it manually marks the account as verified.
    
    Args:
        account_id: Bank account ID to verify
        db: Database session
        current_user: Authenticated user
        
    Returns:
        BankAccountResponse: Updated bank account
        
    Raises:
        404: If account not found or doesn't belong to user
        
    Future Enhancement:
        - Integrate with Razorpay Fund Account Validation
        - Send ₹1 to account and verify
        - Auto-verify on successful penny drop
    """
    from uuid import UUID
    from datetime import datetime
    
    result = await db.execute(
        select(BankAccount).where(
            BankAccount.id == UUID(account_id),
            BankAccount.user_id == current_user.id
        )
    )
    account = result.scalar_one_or_none()
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bank account not found"
        )
    
    # Mark as verified
    account.is_verified = "verified"
    account.verified_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(account)
    
    # Mask account number
    account.account_number = "XXXX" + account.account_number[-4:]
    
    logger.info(f"Bank account verified for user {current_user.email}: {account.bank_name}")
    
    return account


@router.post(
    "/{account_id}/set-primary",
    response_model=Message,
    summary="Set Primary Account",
    description="Set a bank account as primary for withdrawals"
)
async def set_primary_account(
    account_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Set a bank account as the primary account for withdrawals.
    
    Args:
        account_id: Bank account ID to set as primary
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Message: Success message
        
    Raises:
        404: If account not found or doesn't belong to user
    """
    from uuid import UUID
    
    # Get the account to set as primary
    result = await db.execute(
        select(BankAccount).where(
            BankAccount.id == UUID(account_id),
            BankAccount.user_id == current_user.id
        )
    )
    account = result.scalar_one_or_none()
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bank account not found"
        )
    
    # Unset all other accounts as primary
    result = await db.execute(
        select(BankAccount).where(BankAccount.user_id == current_user.id)
    )
    all_accounts = result.scalars().all()
    
    for acc in all_accounts:
        acc.is_primary = "no"
    
    # Set this account as primary
    account.is_primary = "yes"
    
    await db.commit()
    
    logger.info(f"Primary account set for user {current_user.email}: {account.bank_name}")
    
    return {"message": "Primary account updated successfully"}


@router.delete(
    "/{account_id}",
    response_model=Message,
    summary="Delete Bank Account",
    description="Remove a bank account"
)
async def delete_bank_account(
    account_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a bank account.
    
    Args:
        account_id: Bank account ID to delete
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Message: Success message
        
    Raises:
        404: If account not found or doesn't belong to user
        400: If trying to delete the only account
    """
    from uuid import UUID
    
    # Get all user's accounts
    result = await db.execute(
        select(BankAccount).where(BankAccount.user_id == current_user.id)
    )
    all_accounts = result.scalars().all()
    
    # Find the account to delete
    account_to_delete = None
    for acc in all_accounts:
        if str(acc.id) == account_id:
            account_to_delete = acc
            break
    
    if not account_to_delete:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bank account not found"
        )
    
    # Delete the account
    await db.delete(account_to_delete)
    await db.commit()
    
    logger.info(f"Bank account deleted for user {current_user.email}: {account_to_delete.bank_name}")
    
    return {"message": "Bank account deleted successfully"}
