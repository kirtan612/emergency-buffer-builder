"""
UPI API endpoints for Emergency Buffer Builder.

This module provides endpoints for managing user UPI IDs
including adding, verifying, and managing UPI payment methods.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import logging

from database import get_db
from models import User, UPIId
from schemas import UPICreate, UPIResponse, Message
from auth import get_current_user

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/",
    response_model=UPIResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add UPI ID",
    description="Add a new UPI ID for deposits"
)
async def add_upi_id(
    upi_data: UPICreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Add a new UPI ID for the current user.
    
    The UPI ID will be in 'pending' verification status initially.
    Users can verify it by making a small test payment.
    
    Args:
        upi_data: UPI ID details
        db: Database session
        current_user: Authenticated user
        
    Returns:
        UPIResponse: Created UPI ID details
        
    Business Logic:
        - Set first UPI as primary automatically
        - Validate UPI ID format
        - Check for duplicates
        
    Example:
        POST /upi
        {
            "upi_id": "user@paytm",
            "provider": "paytm"
        }
    """
    # Check if UPI ID already exists for this user
    result = await db.execute(
        select(UPIId).where(
            UPIId.user_id == current_user.id,
            UPIId.upi_id == upi_data.upi_id
        )
    )
    existing_upi = result.scalar_one_or_none()
    
    if existing_upi:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This UPI ID is already added"
        )
    
    # Check if this is user's first UPI ID
    result = await db.execute(
        select(UPIId).where(UPIId.user_id == current_user.id)
    )
    existing_upis = result.scalars().all()
    
    # Set as primary if first UPI
    is_primary = "yes" if len(existing_upis) == 0 else "no"
    
    # Create UPI ID
    upi = UPIId(
        user_id=current_user.id,
        upi_id=upi_data.upi_id,
        provider=upi_data.provider.lower(),
        is_primary=is_primary,
        is_verified="pending"
    )
    
    db.add(upi)
    await db.commit()
    await db.refresh(upi)
    
    logger.info(f"UPI ID added for user {current_user.email}: {upi.upi_id}")
    
    return upi


@router.get(
    "/",
    response_model=List[UPIResponse],
    summary="Get UPI IDs",
    description="Get all UPI IDs for the current user"
)
async def get_upi_ids(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all UPI IDs for the current user.
    
    Args:
        db: Database session
        current_user: Authenticated user
        
    Returns:
        List[UPIResponse]: List of user's UPI IDs
    """
    result = await db.execute(
        select(UPIId)
        .where(UPIId.user_id == current_user.id)
        .order_by(UPIId.is_primary.desc(), UPIId.created_at.desc())
    )
    upis = result.scalars().all()
    
    return upis


@router.post(
    "/{upi_id}/verify",
    response_model=UPIResponse,
    summary="Verify UPI ID",
    description="Verify UPI ID (manual verification for now)"
)
async def verify_upi_id(
    upi_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Verify a UPI ID.
    
    In production, this would verify via a small test payment.
    For now, it manually marks the UPI as verified.
    
    Args:
        upi_id: UPI ID to verify
        db: Database session
        current_user: Authenticated user
        
    Returns:
        UPIResponse: Updated UPI ID
        
    Raises:
        404: If UPI not found or doesn't belong to user
        
    Future Enhancement:
        - Send ₹1 test payment
        - Verify payment completion
        - Auto-verify on successful payment
    """
    from uuid import UUID
    from datetime import datetime
    
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
            detail="UPI ID not found"
        )
    
    # Mark as verified
    upi.is_verified = "verified"
    upi.verified_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(upi)
    
    logger.info(f"UPI ID verified for user {current_user.email}: {upi.upi_id}")
    
    return upi


@router.post(
    "/{upi_id}/set-primary",
    response_model=Message,
    summary="Set Primary UPI",
    description="Set a UPI ID as primary for deposits"
)
async def set_primary_upi(
    upi_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Set a UPI ID as the primary UPI for deposits.
    
    Args:
        upi_id: UPI ID to set as primary
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Message: Success message
        
    Raises:
        404: If UPI not found or doesn't belong to user
    """
    from uuid import UUID
    
    # Get the UPI to set as primary
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
            detail="UPI ID not found"
        )
    
    # Unset all other UPIs as primary
    result = await db.execute(
        select(UPIId).where(UPIId.user_id == current_user.id)
    )
    all_upis = result.scalars().all()
    
    for u in all_upis:
        u.is_primary = "no"
    
    # Set this UPI as primary
    upi.is_primary = "yes"
    
    await db.commit()
    
    logger.info(f"Primary UPI set for user {current_user.email}: {upi.upi_id}")
    
    return {"message": "Primary UPI updated successfully"}


@router.delete(
    "/{upi_id}",
    response_model=Message,
    summary="Delete UPI ID",
    description="Remove a UPI ID"
)
async def delete_upi_id(
    upi_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a UPI ID.
    
    Args:
        upi_id: UPI ID to delete
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Message: Success message
        
    Raises:
        404: If UPI not found or doesn't belong to user
    """
    from uuid import UUID
    
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
            detail="UPI ID not found"
        )
    
    await db.delete(upi)
    await db.commit()
    
    logger.info(f"UPI ID deleted for user {current_user.email}: {upi.upi_id}")
    
    return {"message": "UPI ID deleted successfully"}
