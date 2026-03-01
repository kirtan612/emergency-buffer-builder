"""
Authentication API endpoints for Emergency Buffer Builder.

This module provides complete JWT authentication including registration,
login, profile management, and logout functionality.

Rate Limiting Note:
    For production, consider implementing rate limiting using slowapi:
    - Register: 5 requests per hour per IP
    - Login: 10 requests per 15 minutes per IP
    - Profile updates: 20 requests per hour per user
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import timedelta, datetime
import logging

from database import get_db
from models import User, EmergencyFund
from schemas import (
    UserCreate, 
    UserLogin, 
    UserResponse, 
    UserProfileResponse,
    UserUpdate,
    Token,
    Message
)
from auth import (
    get_password_hash,
    authenticate_user,
    create_access_token,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from services.finance_logic import calculate_insights
from email_service import email_service

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/register",
    response_model=Token,
    status_code=status.HTTP_201_CREATED,
    summary="Register New User",
    description="Create a new user account with email, password, and monthly allowance",
    responses={
        201: {"description": "User successfully registered, returns JWT token"},
        409: {"description": "Email already registered"},
        422: {"description": "Validation error"}
    }
)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new user account.
    
    This endpoint creates a new user with hashed password, initializes
    an empty emergency fund, and returns a JWT token for immediate login.
    
    Args:
        user_data: User registration data (name, email, password, monthly_allowance)
        db: Database session
        
    Returns:
        Token: JWT access token (expires in 7 days)
        
    Raises:
        HTTPException 409: If email already exists
        HTTPException 422: If validation fails
        
    Process:
        1. Check email uniqueness
        2. Hash password with bcrypt
        3. Create User record
        4. Initialize EmergencyFund with ₹0 balance
        5. Generate JWT token
        6. Log registration
        7. Return token for auto-login
        
    Security:
        - Password hashed with bcrypt (cost factor 12)
        - JWT token expires in 7 days
        - Email uniqueness enforced at database level
        
    Rate Limiting (Production):
        - Recommended: 5 requests per hour per IP
        - Use slowapi or similar middleware
    """
    # Check if email already exists (409 Conflict for existing resource)
    result = await db.execute(
        select(User).where(User.email == user_data.email)
    )
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        logger.warning(f"Registration attempt with existing email: {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Create new user
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hashed_password,
        monthly_allowance=user_data.monthly_allowance
    )
    
    db.add(new_user)
    await db.flush()  # Flush to get user.id
    
    # Initialize emergency fund with 0 balance
    emergency_fund = EmergencyFund(
        user_id=new_user.id,
        total_amount=0
    )
    db.add(emergency_fund)
    
    await db.commit()
    await db.refresh(new_user)
    
    # Log successful registration
    logger.info(f"New user registered: {new_user.email}")
    
    # Send welcome email
    try:
        email_service.send_welcome_email(
            user_name=new_user.name,
            user_email=new_user.email,
            user_id=str(new_user.id)
        )
        logger.info(f"Welcome email sent to {new_user.email}")
    except Exception as e:
        logger.error(f"Failed to send welcome email to {new_user.email}: {e}")
        # Don't fail registration if email fails
    
    # Generate JWT token (7-day expiry)
    access_token = create_access_token(
        data={"sub": str(new_user.id)},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return Token(access_token=access_token, token_type="bearer")



@router.post(
    "/login",
    response_model=Token,
    summary="User Login",
    description="Authenticate user with email and password, returns JWT token",
    responses={
        200: {"description": "Login successful, returns JWT token"},
        401: {"description": "Invalid credentials"},
        422: {"description": "Validation error"}
    }
)
async def login(
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """
    Authenticate user and generate JWT token.
    
    This endpoint verifies user credentials and returns a JWT token
    for accessing protected endpoints.
    
    Args:
        credentials: User login credentials (email, password)
        db: Database session
        
    Returns:
        Token: JWT access token (expires in 7 days)
        
    Raises:
        HTTPException 401: If credentials are invalid
        
    Security:
        - Same error message for non-existent email and wrong password
          to prevent user enumeration attacks
        - Password verified using bcrypt
        - JWT token expires in 7 days
        
    Rate Limiting (Production):
        - Recommended: 10 requests per 15 minutes per IP
        - Implement account lockout after 5 failed attempts
        - Use slowapi or similar middleware
        
    Example:
        POST /auth/login
        {
            "email": "user@example.com",
            "password": "password123"
        }
        
        Response:
        {
            "access_token": "eyJhbGc...",
            "token_type": "bearer"
        }
    """
    # Authenticate user (returns None if email not found or password wrong)
    user = await authenticate_user(credentials.email, credentials.password, db)
    
    if not user:
        # Same message for both cases to prevent enumeration
        logger.warning(f"Failed login attempt for email: {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Log successful login
    logger.info(f"User logged in: {user.email}")
    
    # Generate JWT token (7-day expiry)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return Token(access_token=access_token, token_type="bearer")



@router.get(
    "/me",
    response_model=UserProfileResponse,
    summary="Get Current User Profile",
    description="Get authenticated user's profile with account details",
    responses={
        200: {"description": "User profile retrieved successfully"},
        401: {"description": "Not authenticated or invalid token"}
    }
)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get the current authenticated user's profile.
    
    This is a protected endpoint that requires a valid JWT token.
    Returns user profile with additional computed fields.
    
    Args:
        current_user: Authenticated user from JWT token
        db: Database session
        
    Returns:
        UserProfileResponse: User profile with account details
        
    Includes:
        - id: User's unique identifier
        - name: Full name
        - email: Email address
        - monthly_allowance: Monthly budget
        - created_at: Account creation timestamp
        - account_age_days: Days since account creation
        
    Security:
        - Requires valid JWT token in Authorization header
        - Token must not be expired
        - User must exist in database
        
    Example:
        GET /auth/me
        Headers: Authorization: Bearer eyJhbGc...
        
        Response:
        {
            "id": "uuid",
            "name": "John Doe",
            "email": "john@example.com",
            "monthly_allowance": 15000.00,
            "created_at": "2024-02-25T10:30:00Z",
            "account_age_days": 45
        }
    """
    # Calculate account age in days
    account_age = datetime.utcnow() - current_user.created_at
    account_age_days = account_age.days
    
    return UserProfileResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        monthly_allowance=current_user.monthly_allowance,
        created_at=current_user.created_at,
        account_age_days=account_age_days
    )



@router.put(
    "/me",
    response_model=UserResponse,
    summary="Update User Profile",
    description="Update authenticated user's name and/or monthly allowance",
    responses={
        200: {"description": "Profile updated successfully"},
        401: {"description": "Not authenticated or invalid token"},
        422: {"description": "Validation error"}
    }
)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update the current authenticated user's profile.
    
    This endpoint allows users to update their name and/or monthly allowance.
    If monthly_allowance is changed, financial insights are recalculated.
    
    Args:
        user_update: Updated user data (name and/or monthly_allowance)
        current_user: Authenticated user from JWT token
        db: Database session
        
    Returns:
        UserResponse: Updated user profile
        
    Updates:
        - name: User's full name (optional)
        - monthly_allowance: Monthly budget (optional)
        
    Side Effects:
        - If monthly_allowance changes, triggers insight recalculation
        - Updates affect daily budget calculations
        - Impacts risk level assessments
        
    Security:
        - Requires valid JWT token
        - Users can only update their own profile
        - Email cannot be changed (create new account instead)
        
    Rate Limiting (Production):
        - Recommended: 20 requests per hour per user
        
    Example:
        PUT /auth/me
        Headers: Authorization: Bearer eyJhbGc...
        {
            "name": "John Smith",
            "monthly_allowance": 18000.00
        }
        
        Response:
        {
            "id": "uuid",
            "name": "John Smith",
            "email": "john@example.com",
            "monthly_allowance": 18000.00,
            "created_at": "2024-02-25T10:30:00Z"
        }
    """
    # Track if monthly_allowance changed for insight recalculation
    allowance_changed = False
    
    # Update name if provided
    if user_update.name is not None:
        current_user.name = user_update.name
        logger.info(f"User {current_user.email} updated name to: {user_update.name}")
    
    # Update monthly_allowance if provided
    if user_update.monthly_allowance is not None:
        old_allowance = current_user.monthly_allowance
        current_user.monthly_allowance = user_update.monthly_allowance
        allowance_changed = True
        logger.info(
            f"User {current_user.email} updated monthly_allowance: "
            f"₹{old_allowance} → ₹{user_update.monthly_allowance}"
        )
    
    # Commit changes
    await db.commit()
    await db.refresh(current_user)
    
    # Recalculate insights if monthly allowance changed
    if allowance_changed:
        try:
            await calculate_insights(db, current_user.id)
            logger.info(f"Recalculated insights for user: {current_user.email}")
        except Exception as e:
            logger.error(f"Failed to recalculate insights: {e}")
            # Don't fail the request if insight calculation fails
    
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        monthly_allowance=current_user.monthly_allowance,
        created_at=current_user.created_at
    )



@router.post(
    "/logout",
    response_model=Message,
    summary="User Logout",
    description="Logout user (client-side token removal)",
    responses={
        200: {"description": "Logout successful"},
        401: {"description": "Not authenticated"}
    }
)
async def logout(
    current_user: User = Depends(get_current_user)
):
    """
    Logout the current authenticated user.
    
    Since JWT tokens are stateless, logout is primarily handled client-side
    by removing the token from storage. This endpoint confirms the logout
    action and can be extended for server-side token invalidation.
    
    Args:
        current_user: Authenticated user from JWT token
        
    Returns:
        Message: Logout confirmation message
        
    Client-Side Actions:
        1. Remove token from localStorage/sessionStorage
        2. Clear any cached user data
        3. Redirect to login page
        4. Clear Authorization header
        
    Server-Side Token Invalidation (Optional):
        For enhanced security, implement token blacklisting:
        
        1. Store token in Redis with TTL matching token expiry
        2. Check blacklist in get_current_user dependency
        3. Reject requests with blacklisted tokens
        
        Example implementation:
        ```python
        # In logout endpoint:
        token_jti = decode_token(token)["jti"]  # Add jti to token
        redis_client.setex(
            f"blacklist:{token_jti}",
            ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "1"
        )
        
        # In get_current_user:
        if redis_client.exists(f"blacklist:{token_jti}"):
            raise HTTPException(401, "Token has been revoked")
        ```
        
    Security Notes:
        - JWT tokens remain valid until expiry (7 days)
        - For immediate invalidation, implement token blacklist
        - Consider shorter token expiry with refresh tokens
        - Monitor for suspicious activity after logout
        
    Example:
        POST /auth/logout
        Headers: Authorization: Bearer eyJhbGc...
        
        Response:
        {
            "message": "Logged out successfully"
        }
    """
    logger.info(f"User logged out: {current_user.email}")
    
    # Note: Add token to blacklist here if implementing server-side invalidation
    # Example: await blacklist_token(token, db)
    
    return Message(message="Logged out successfully")
