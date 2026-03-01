"""
Wallet API endpoints for Emergency Buffer Builder.

Simple UPI-based wallet system with manual verification.
Users deposit to company UPI, withdraw to their UPI.
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional
from datetime import datetime
import logging
from uuid import UUID

from database import get_db
from models import User, EmergencyFund, PaymentTransaction, UPIId
from schemas import Message
from auth import get_current_user
from email_service import email_service

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

# Company UPI ID (configure in .env in production)
COMPANY_UPI_ID = "emergencybuffer@paytm"


@router.post(
    "/deposit/request",
    status_code=status.HTTP_201_CREATED,
    summary="Request Deposit",
    description="Submit deposit request after paying to company UPI"
)
async def request_deposit(
    amount: float,
    upi_reference: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submit a deposit request after making UPI payment.
    
    Flow:
    1. User pays to company UPI ID
    2. User submits this request with payment reference
    3. Admin verifies payment
    4. Balance updated after approval
    
    Args:
        amount: Amount deposited
        upi_reference: UPI transaction reference/ID
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Payment transaction details
    """
    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount must be greater than 0"
        )
    
    # Create payment transaction
    transaction = PaymentTransaction(
        user_id=current_user.id,
        transaction_type="deposit",
        amount=amount,
        payment_method="upi",
        payment_reference=upi_reference,
        status="pending"
    )
    
    db.add(transaction)
    await db.commit()
    await db.refresh(transaction)
    
    logger.info(f"Deposit request created: {transaction.id} for user {current_user.email}, amount: ₹{amount}")
    
    # Send email notification
    try:
        email_service.send_deposit_request_notification(
            user_name=current_user.name,
            user_email=current_user.email,
            amount=amount,
            reference=upi_reference
        )
        logger.info(f"Deposit request email sent to {current_user.email}")
    except Exception as e:
        logger.error(f"Failed to send deposit request email: {e}")
    
    return {
        "message": "Deposit request submitted successfully",
        "transaction_id": str(transaction.id),
        "amount": amount,
        "status": "pending",
        "note": "Your deposit will be verified within 1 hour"
    }


@router.post(
    "/withdraw/request",
    status_code=status.HTTP_201_CREATED,
    summary="Request Withdrawal",
    description="Request withdrawal to your UPI ID"
)
async def request_withdrawal(
    amount: float,
    upi_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Request withdrawal to user's UPI ID.
    
    Flow:
    1. User submits withdrawal request
    2. System validates balance
    3. Admin transfers money to user's UPI
    4. Balance deducted after completion
    
    Args:
        amount: Amount to withdraw
        upi_id: User's UPI ID (UUID from upi_ids table)
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Withdrawal request details
    """
    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount must be greater than 0"
        )
    
    # Get user's emergency fund
    result = await db.execute(
        select(EmergencyFund).where(EmergencyFund.user_id == current_user.id)
    )
    fund = result.scalar_one_or_none()
    
    if not fund:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Emergency fund not found"
        )
    
    # Check if fund is locked
    if fund.locked_until and fund.locked_until > datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Fund is locked until {fund.locked_until.strftime('%Y-%m-%d')}"
        )
    
    # Check sufficient balance
    if float(fund.total_amount) < amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient balance. Available: ₹{fund.total_amount}"
        )
    
    # Verify UPI ID belongs to user
    result = await db.execute(
        select(UPIId).where(
            UPIId.id == UUID(upi_id),
            UPIId.user_id == current_user.id
        )
    )
    upi = result.scalar_one_or_none()
    
    if not upi:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="UPI ID not found or doesn't belong to you"
        )
    
    # Create withdrawal transaction
    transaction = PaymentTransaction(
        user_id=current_user.id,
        transaction_type="withdrawal",
        amount=amount,
        payment_method="upi",
        upi_id=UUID(upi_id),
        status="pending"
    )
    
    db.add(transaction)
    await db.commit()
    await db.refresh(transaction)
    
    logger.info(f"Withdrawal request created: {transaction.id} for user {current_user.email}, amount: ₹{amount}")
    
    # Send email notification
    try:
        email_service.send_withdrawal_request_notification(
            user_name=current_user.name,
            user_email=current_user.email,
            amount=amount,
            upi_id=upi.upi_id
        )
        logger.info(f"Withdrawal request email sent to {current_user.email}")
    except Exception as e:
        logger.error(f"Failed to send withdrawal request email: {e}")
    
    return {
        "message": "Withdrawal request submitted successfully",
        "transaction_id": str(transaction.id),
        "amount": amount,
        "upi_id": upi.upi_id,
        "status": "pending",
        "note": "Money will be transferred within 1-2 hours"
    }


@router.get(
    "/transactions",
    summary="Get Transaction History",
    description="Get all wallet transactions (deposits and withdrawals)"
)
async def get_transactions(
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get user's transaction history.
    
    Args:
        limit: Maximum number of transactions
        offset: Pagination offset
        db: Database session
        current_user: Authenticated user
        
    Returns:
        List of transactions
    """
    result = await db.execute(
        select(PaymentTransaction)
        .where(PaymentTransaction.user_id == current_user.id)
        .order_by(desc(PaymentTransaction.initiated_at))
        .limit(limit)
        .offset(offset)
    )
    transactions = result.scalars().all()
    
    # Format response
    formatted_transactions = []
    for txn in transactions:
        # Get UPI details if applicable
        upi_details = None
        if txn.upi_id:
            upi_result = await db.execute(
                select(UPIId).where(UPIId.id == txn.upi_id)
            )
            upi = upi_result.scalar_one_or_none()
            if upi:
                upi_details = upi.upi_id
        
        formatted_transactions.append({
            "id": str(txn.id),
            "type": txn.transaction_type,
            "amount": float(txn.amount),
            "payment_method": txn.payment_method,
            "payment_reference": txn.payment_reference,
            "upi_id": upi_details,
            "status": txn.status,
            "initiated_at": txn.initiated_at.isoformat(),
            "completed_at": txn.completed_at.isoformat() if txn.completed_at else None
        })
    
    return {
        "transactions": formatted_transactions,
        "total": len(formatted_transactions)
    }


@router.get(
    "/pending",
    summary="Get Pending Requests",
    description="Get user's pending deposit/withdrawal requests"
)
async def get_pending_requests(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get user's pending transactions.
    
    Args:
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Pending deposits and withdrawals
    """
    result = await db.execute(
        select(PaymentTransaction)
        .where(
            PaymentTransaction.user_id == current_user.id,
            PaymentTransaction.status == "pending"
        )
        .order_by(desc(PaymentTransaction.initiated_at))
    )
    pending = result.scalars().all()
    
    deposits = []
    withdrawals = []
    
    for txn in pending:
        data = {
            "id": str(txn.id),
            "amount": float(txn.amount),
            "payment_reference": txn.payment_reference,
            "requested_at": txn.initiated_at.isoformat()
        }
        
        if txn.transaction_type == "deposit":
            deposits.append(data)
        else:
            # Get UPI details
            if txn.upi_id:
                upi_result = await db.execute(
                    select(UPIId).where(UPIId.id == txn.upi_id)
                )
                upi = upi_result.scalar_one_or_none()
                if upi:
                    data["upi_id"] = upi.upi_id
            withdrawals.append(data)
    
    return {
        "pending_deposits": deposits,
        "pending_withdrawals": withdrawals
    }


@router.get(
    "/company-upi",
    summary="Get Company UPI ID",
    description="Get company UPI ID for deposits"
)
async def get_company_upi():
    """
    Get company UPI ID for making deposits.
    
    Returns:
        Company UPI ID and QR code URL
    """
    return {
        "upi_id": COMPANY_UPI_ID,
        "company_name": "Emergency Buffer Builder",
        "founder": "Kirtan Jogani",
        "contact_email": "kirtanjogani3@gmail.com",
        "contact_phone": "+91-9374134341",
        "qr_code_url": f"upi://pay?pa={COMPANY_UPI_ID}&pn=Emergency Buffer&cu=INR",
        "instructions": [
            "Open any UPI app (Paytm, PhonePe, GPay)",
            f"Pay to: {COMPANY_UPI_ID}",
            "Enter the amount you want to add",
            "Complete the payment",
            "Copy the UPI reference number",
            "Submit deposit request in the app"
        ]
    }


# Admin endpoints (add authentication middleware in production)
@router.post(
    "/admin/deposits/{transaction_id}/approve",
    summary="Approve Deposit (Admin)",
    description="Admin approves deposit and updates balance"
)
async def approve_deposit(
    transaction_id: str,
    db: AsyncSession = Depends(get_db)
    # Add admin authentication here
):
    """
    Admin approves a deposit request.
    
    Args:
        transaction_id: Transaction ID to approve
        db: Database session
        
    Returns:
        Success message
    """
    # Get transaction
    result = await db.execute(
        select(PaymentTransaction).where(PaymentTransaction.id == UUID(transaction_id))
    )
    transaction = result.scalar_one_or_none()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    if transaction.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Transaction is already {transaction.status}"
        )
    
    # Update emergency fund balance
    result = await db.execute(
        select(EmergencyFund).where(EmergencyFund.user_id == transaction.user_id)
    )
    fund = result.scalar_one_or_none()
    
    if fund:
        fund.total_amount += transaction.amount
    else:
        # Create fund if doesn't exist
        fund = EmergencyFund(
            user_id=transaction.user_id,
            total_amount=transaction.amount
        )
        db.add(fund)
    
    # Update transaction status
    transaction.status = "success"
    transaction.completed_at = datetime.utcnow()
    
    await db.commit()
    
    # Get user details for email
    result = await db.execute(
        select(User).where(User.id == transaction.user_id)
    )
    user = result.scalar_one_or_none()
    
    # Calculate survival days
    from services.finance_logic import calculate_insights
    insights = await calculate_insights(db, transaction.user_id)
    
    logger.info(f"Deposit approved: {transaction_id}, amount: ₹{transaction.amount}")
    
    # Send confirmation email
    if user:
        try:
            email_service.send_deposit_confirmation(
                user_name=user.name,
                user_email=user.email,
                amount=float(transaction.amount),
                reference=transaction.payment_reference,
                old_balance=float(fund.total_amount - transaction.amount),
                new_balance=float(fund.total_amount),
                survival_days=insights['survival_days']
            )
            logger.info(f"Deposit confirmation email sent to {user.email}")
        except Exception as e:
            logger.error(f"Failed to send deposit confirmation email: {e}")
    
    return {
        "message": "Deposit approved successfully",
        "new_balance": float(fund.total_amount)
    }


@router.post(
    "/admin/withdrawals/{transaction_id}/complete",
    summary="Complete Withdrawal (Admin)",
    description="Admin marks withdrawal as completed after transferring money"
)
async def complete_withdrawal(
    transaction_id: str,
    upi_reference: str,
    db: AsyncSession = Depends(get_db)
    # Add admin authentication here
):
    """
    Admin completes a withdrawal request.
    
    Args:
        transaction_id: Transaction ID to complete
        upi_reference: UPI reference of the transfer
        db: Database session
        
    Returns:
        Success message
    """
    # Get transaction
    result = await db.execute(
        select(PaymentTransaction).where(PaymentTransaction.id == UUID(transaction_id))
    )
    transaction = result.scalar_one_or_none()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    if transaction.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Transaction is already {transaction.status}"
        )
    
    # Update emergency fund balance
    result = await db.execute(
        select(EmergencyFund).where(EmergencyFund.user_id == transaction.user_id)
    )
    fund = result.scalar_one_or_none()
    
    if not fund or fund.total_amount < transaction.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient balance"
        )
    
    fund.total_amount -= transaction.amount
    
    # Update transaction status
    transaction.status = "completed"
    transaction.completed_at = datetime.utcnow()
    transaction.payment_reference = upi_reference
    
    await db.commit()
    
    # Get user and UPI details for email
    result = await db.execute(
        select(User).where(User.id == transaction.user_id)
    )
    user = result.scalar_one_or_none()
    
    result = await db.execute(
        select(UPIId).where(UPIId.id == transaction.upi_id)
    )
    upi = result.scalar_one_or_none()
    
    # Calculate survival days
    from services.finance_logic import calculate_insights
    insights = await calculate_insights(db, transaction.user_id)
    
    logger.info(f"Withdrawal completed: {transaction_id}, amount: ₹{transaction.amount}")
    
    # Send confirmation email
    if user and upi:
        try:
            email_service.send_withdrawal_confirmation(
                user_name=user.name,
                user_email=user.email,
                amount=float(transaction.amount),
                upi_id=upi.upi_id,
                old_balance=float(fund.total_amount + transaction.amount),
                new_balance=float(fund.total_amount),
                survival_days=insights['survival_days']
            )
            logger.info(f"Withdrawal confirmation email sent to {user.email}")
        except Exception as e:
            logger.error(f"Failed to send withdrawal confirmation email: {e}")
    
    return {
        "message": "Withdrawal completed successfully",
        "new_balance": float(fund.total_amount)
    }
