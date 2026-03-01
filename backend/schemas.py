"""
Pydantic v2 schemas for Emergency Buffer Builder API.

This module defines all request and response models with validation rules
for data serialization and deserialization.
"""

from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime as dt, date as d
from decimal import Decimal
from uuid import UUID


# ============================================
# USER SCHEMAS
# ============================================

class UserCreate(BaseModel):
    """
    Schema for user registration.
    
    Attributes:
        name: Full name of the user
        email: Valid email address
        password: Password (minimum 8 characters)
        monthly_allowance: User's monthly budget/allowance
    """
    name: str = Field(..., min_length=1, max_length=100, description="Full name")
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=8, max_length=100, description="Password (min 8 characters)")
    monthly_allowance: Decimal = Field(..., ge=0, description="Monthly allowance/budget")

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Validate that name is not empty after stripping whitespace."""
        if not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()


class UserLogin(BaseModel):
    """
    Schema for user login.
    
    Attributes:
        email: User's email address
        password: User's password
    """
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., description="Password")


class UserUpdate(BaseModel):
    """
    Schema for updating user profile.
    
    Attributes:
        name: Updated full name (optional)
        monthly_allowance: Updated monthly budget (optional)
    """
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="Full name")
    monthly_allowance: Optional[Decimal] = Field(None, ge=0, description="Monthly allowance/budget")

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        """Validate that name is not empty after stripping whitespace."""
        if v is not None and not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip() if v else None


class UserResponse(BaseModel):
    """
    Schema for user data in responses (excludes password).
    
    Attributes:
        id: User's unique identifier
        name: Full name
        email: Email address
        monthly_allowance: Monthly budget
        created_at: Account creation timestamp
    """
    id: UUID
    name: str
    email: str
    monthly_allowance: Decimal
    created_at: dt

    model_config = ConfigDict(from_attributes=True)


class UserProfileResponse(BaseModel):
    """
    Schema for detailed user profile with additional computed fields.
    
    Attributes:
        id: User's unique identifier
        name: Full name
        email: Email address
        monthly_allowance: Monthly budget
        created_at: Account creation timestamp
        account_age_days: Number of days since account creation
    """
    id: UUID
    name: str
    email: str
    monthly_allowance: Decimal
    created_at: dt
    account_age_days: int

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    """
    Schema for JWT token response.
    
    Attributes:
        access_token: JWT access token
        token_type: Token type (always "bearer")
    """
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """
    Schema for decoded JWT token data.
    
    Attributes:
        user_id: User's unique identifier from token
    """
    user_id: Optional[UUID] = None


# ============================================
# TRANSACTION SCHEMAS
# ============================================

# Allowed transaction categories
ALLOWED_CATEGORIES = [
    "food",
    "transport",
    "education",
    "entertainment",
    "healthcare",
    "shopping",
    "housing",
    "utilities",
    "subscriptions",
    "other"
]


class TransactionCreate(BaseModel):
    """
    Schema for creating a new transaction.
    
    Attributes:
        amount: Transaction amount (negative for expenses, positive for income)
        category: Transaction category
        description: Optional description
        date: Transaction date
    """
    amount: Decimal = Field(..., description="Transaction amount")
    category: str = Field(..., description="Transaction category")
    description: Optional[str] = Field(None, max_length=255, description="Optional description")
    date: d = Field(..., description="Transaction date")

    @field_validator('amount')
    @classmethod
    def validate_amount(cls, v: Decimal) -> Decimal:
        """Validate that amount is not zero."""
        if v == 0:
            raise ValueError('Amount cannot be zero')
        return v

    @field_validator('category')
    @classmethod
    def validate_category(cls, v: str) -> str:
        """Validate that category is from allowed list."""
        if v.lower() not in ALLOWED_CATEGORIES:
            raise ValueError(f'Category must be one of: {", ".join(ALLOWED_CATEGORIES)}')
        return v.lower()


class TransactionResponse(BaseModel):
    """
    Schema for transaction data in responses.
    
    Attributes:
        id: Transaction unique identifier
        user_id: User who made the transaction
        amount: Transaction amount
        category: Transaction category
        description: Transaction description
        date: Transaction date
        created_at: Timestamp when transaction was logged
    """
    id: UUID
    user_id: UUID
    amount: Decimal
    category: str
    description: Optional[str]
    date: d
    created_at: dt

    model_config = ConfigDict(from_attributes=True)


class TransactionList(BaseModel):
    """
    Schema for paginated transaction list.
    
    Attributes:
        transactions: List of transactions
        total_count: Total number of transactions
    """
    transactions: List[TransactionResponse]
    total_count: int


# ============================================
# EMERGENCY FUND SCHEMAS
# ============================================

class FundDeposit(BaseModel):
    """
    Schema for depositing money into emergency fund.
    
    Attributes:
        amount: Amount to deposit (must be positive)
        lock_days: Optional number of days to lock the fund (0-90)
    """
    amount: Decimal = Field(..., gt=0, description="Amount to deposit (must be positive)")
    lock_days: Optional[int] = Field(None, ge=0, le=90, description="Days to lock fund (0-90)")


class FundWithdraw(BaseModel):
    """
    Schema for withdrawing money from emergency fund.
    
    Attributes:
        amount: Amount to withdraw (must be positive)
    """
    amount: Decimal = Field(..., gt=0, description="Amount to withdraw (must be positive)")


class FundResponse(BaseModel):
    """
    Schema for emergency fund data in responses.
    
    Attributes:
        user_id: User who owns the fund
        total_amount: Current fund balance
        locked_until: Datetime until which fund is locked (if applicable)
        survival_days: Calculated survival days
        risk_level: Current risk level (Safe/Warning/Critical)
    """
    user_id: UUID
    total_amount: Decimal
    locked_until: Optional[dt]
    survival_days: Optional[Decimal] = None
    risk_level: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ============================================
# DASHBOARD SCHEMAS
# ============================================

class DashboardResponse(BaseModel):
    """
    Schema for dashboard insights and overview.
    
    Attributes:
        avg_daily_spending: Average daily spending (last 30 days)
        total_30d_spending: Total spending in last 30 days
        emergency_fund: Current emergency fund balance
        survival_days: Number of days user can survive
        risk_level: Current risk level (Safe/Warning/Critical)
        monthly_allowance: User's monthly budget
        recent_transactions: Last 5 transactions
        fund_progress_percent: Progress toward 3-month emergency fund goal
    """
    avg_daily_spending: Decimal
    total_30d_spending: Decimal
    emergency_fund: Decimal
    survival_days: Decimal
    risk_level: str
    monthly_allowance: Decimal
    recent_transactions: List[TransactionResponse]
    fund_progress_percent: float = Field(ge=0, le=100, description="Progress percentage (0-100)")


# ============================================
# CHATBOT SCHEMAS
# ============================================

class ChatMessage(BaseModel):
    """
    Schema for sending a message to the chatbot.
    
    Attributes:
        message: User's message to the chatbot (max 500 characters)
    """
    message: str = Field(..., min_length=1, max_length=500, description="Message to chatbot")

    @field_validator('message')
    @classmethod
    def validate_message(cls, v: str) -> str:
        """Validate that message is not empty after stripping whitespace."""
        if not v.strip():
            raise ValueError('Message cannot be empty')
        return v.strip()


class ChatResponse(BaseModel):
    """
    Schema for chatbot response.
    
    Attributes:
        reply: Chatbot's text response
        suggestions: List of suggested follow-up questions
        context: Additional context data (e.g., calculated values)
    """
    reply: str
    suggestions: List[str] = Field(default_factory=list)
    context: Dict[str, Any] = Field(default_factory=dict)


# ============================================
# INSIGHT SCHEMAS
# ============================================

class InsightResponse(BaseModel):
    """
    Schema for financial insights data.
    
    Attributes:
        avg_daily_spending: Average daily spending
        survival_days: Number of survival days
        risk_level: Risk classification (Safe/Warning/Critical)
        calculated_at: Timestamp when insights were calculated
    """
    avg_daily_spending: Decimal
    survival_days: Decimal
    risk_level: str
    calculated_at: dt

    model_config = ConfigDict(from_attributes=True)


# ============================================
# UTILITY SCHEMAS
# ============================================

class Message(BaseModel):
    """
    Generic message response schema.
    
    Attributes:
        message: Response message
    """
    message: str


class ErrorResponse(BaseModel):
    """
    Error response schema.
    
    Attributes:
        detail: Error detail message
    """
    detail: str


# ============================================
# BANK ACCOUNT SCHEMAS
# ============================================

class BankAccountCreate(BaseModel):
    """
    Schema for adding a new bank account.
    
    Attributes:
        account_number: Bank account number
        ifsc_code: Bank IFSC code (11 characters)
        account_holder_name: Name as per bank account
        bank_name: Name of the bank
    """
    account_number: str = Field(..., min_length=9, max_length=18, description="Bank account number")
    ifsc_code: str = Field(..., min_length=11, max_length=11, description="Bank IFSC code")
    account_holder_name: str = Field(..., min_length=1, max_length=100, description="Account holder name")
    bank_name: str = Field(..., min_length=1, max_length=100, description="Bank name")

    @field_validator('ifsc_code')
    @classmethod
    def validate_ifsc(cls, v: str) -> str:
        """Validate IFSC code format."""
        v = v.upper().strip()
        if not v[:4].isalpha() or not v[4] == '0' or not v[5:].isalnum():
            raise ValueError('Invalid IFSC code format')
        return v

    @field_validator('account_number')
    @classmethod
    def validate_account_number(cls, v: str) -> str:
        """Validate account number contains only digits."""
        v = v.strip()
        if not v.isdigit():
            raise ValueError('Account number must contain only digits')
        return v


class BankAccountResponse(BaseModel):
    """
    Schema for bank account data in responses.
    
    Attributes:
        id: Bank account unique identifier
        user_id: User who owns the account
        account_number: Masked account number (last 4 digits visible)
        ifsc_code: Bank IFSC code
        account_holder_name: Account holder name
        bank_name: Bank name
        is_verified: Verification status
        verified_at: Verification timestamp
        is_primary: Whether this is primary account
        created_at: When account was added
    """
    id: UUID
    user_id: UUID
    account_number: str
    ifsc_code: str
    account_holder_name: str
    bank_name: str
    is_verified: str
    verified_at: Optional[dt]
    is_primary: str
    created_at: dt

    model_config = ConfigDict(from_attributes=True)


# ============================================
# UPI SCHEMAS
# ============================================

class UPICreate(BaseModel):
    """
    Schema for adding a new UPI ID.
    
    Attributes:
        upi_id: UPI ID (e.g., user@paytm, user@phonepe)
        provider: UPI provider name
    """
    upi_id: str = Field(..., min_length=5, max_length=100, description="UPI ID")
    provider: str = Field(..., min_length=2, max_length=50, description="UPI provider")

    @field_validator('upi_id')
    @classmethod
    def validate_upi_id(cls, v: str) -> str:
        """Validate UPI ID format."""
        v = v.lower().strip()
        if '@' not in v:
            raise ValueError('UPI ID must contain @')
        parts = v.split('@')
        if len(parts) != 2 or not parts[0] or not parts[1]:
            raise ValueError('Invalid UPI ID format')
        return v


class UPIResponse(BaseModel):
    """
    Schema for UPI ID data in responses.
    
    Attributes:
        id: UPI ID unique identifier
        user_id: User who owns the UPI ID
        upi_id: UPI ID
        provider: UPI provider
        is_verified: Verification status
        verified_at: Verification timestamp
        is_primary: Whether this is primary UPI
        created_at: When UPI was added
    """
    id: UUID
    user_id: UUID
    upi_id: str
    provider: str
    is_verified: str
    verified_at: Optional[dt]
    is_primary: str
    created_at: dt

    model_config = ConfigDict(from_attributes=True)


# ============================================
# PAYMENT TRANSACTION SCHEMAS
# ============================================

class PaymentInitiate(BaseModel):
    """
    Schema for initiating a payment transaction.
    
    Attributes:
        transaction_type: Type of transaction (deposit/withdrawal)
        amount: Transaction amount
        payment_method: Payment method (upi/bank_transfer)
        bank_account_id: Bank account ID (for withdrawals)
        upi_id: UPI ID (for deposits)
    """
    transaction_type: str = Field(..., description="Transaction type: deposit or withdrawal")
    amount: Decimal = Field(..., gt=0, description="Transaction amount")
    payment_method: str = Field(..., description="Payment method: upi or bank_transfer")
    bank_account_id: Optional[UUID] = Field(None, description="Bank account ID for withdrawal")
    upi_id: Optional[UUID] = Field(None, description="UPI ID for deposit")

    @field_validator('transaction_type')
    @classmethod
    def validate_transaction_type(cls, v: str) -> str:
        """Validate transaction type."""
        v = v.lower()
        if v not in ['deposit', 'withdrawal']:
            raise ValueError('Transaction type must be deposit or withdrawal')
        return v

    @field_validator('payment_method')
    @classmethod
    def validate_payment_method(cls, v: str) -> str:
        """Validate payment method."""
        v = v.lower()
        if v not in ['upi', 'bank_transfer', 'card']:
            raise ValueError('Payment method must be upi, bank_transfer, or card')
        return v


class PaymentConfirm(BaseModel):
    """
    Schema for confirming a payment transaction.
    
    Attributes:
        payment_reference: External payment reference number
        transaction_pin: User's transaction PIN for verification
    """
    payment_reference: Optional[str] = Field(None, max_length=100, description="Payment reference number")
    transaction_pin: str = Field(..., min_length=4, max_length=4, description="4-digit transaction PIN")

    @field_validator('transaction_pin')
    @classmethod
    def validate_pin(cls, v: str) -> str:
        """Validate PIN is 4 digits."""
        if not v.isdigit() or len(v) != 4:
            raise ValueError('Transaction PIN must be exactly 4 digits')
        return v


class PaymentTransactionResponse(BaseModel):
    """
    Schema for payment transaction data in responses.
    
    Attributes:
        id: Transaction unique identifier
        user_id: User who initiated transaction
        transaction_type: Type of transaction
        amount: Transaction amount
        payment_method: Payment method used
        payment_reference: External payment reference
        status: Transaction status
        bank_account_id: Bank account used
        upi_id: UPI ID used
        initiated_at: When transaction was initiated
        completed_at: When transaction was completed
        failure_reason: Reason if failed
        receipt_url: Receipt download URL
    """
    id: UUID
    user_id: UUID
    transaction_type: str
    amount: Decimal
    payment_method: str
    payment_reference: Optional[str]
    status: str
    bank_account_id: Optional[UUID]
    upi_id: Optional[UUID]
    initiated_at: dt
    completed_at: Optional[dt]
    failure_reason: Optional[str]
    receipt_url: Optional[str]

    model_config = ConfigDict(from_attributes=True)


# ============================================
# TRANSACTION PIN SCHEMAS
# ============================================

class TransactionPINCreate(BaseModel):
    """
    Schema for creating a transaction PIN.
    
    Attributes:
        pin: 4-digit PIN
        confirm_pin: PIN confirmation
    """
    pin: str = Field(..., min_length=4, max_length=4, description="4-digit PIN")
    confirm_pin: str = Field(..., min_length=4, max_length=4, description="Confirm PIN")

    @field_validator('pin', 'confirm_pin')
    @classmethod
    def validate_pin(cls, v: str) -> str:
        """Validate PIN is 4 digits."""
        if not v.isdigit() or len(v) != 4:
            raise ValueError('PIN must be exactly 4 digits')
        return v

    @field_validator('confirm_pin')
    @classmethod
    def validate_pins_match(cls, v: str, info) -> str:
        """Validate PINs match."""
        if 'pin' in info.data and v != info.data['pin']:
            raise ValueError('PINs do not match')
        return v


class TransactionPINVerify(BaseModel):
    """
    Schema for verifying a transaction PIN.
    
    Attributes:
        pin: 4-digit PIN to verify
    """
    pin: str = Field(..., min_length=4, max_length=4, description="4-digit PIN")

    @field_validator('pin')
    @classmethod
    def validate_pin(cls, v: str) -> str:
        """Validate PIN is 4 digits."""
        if not v.isdigit() or len(v) != 4:
            raise ValueError('PIN must be exactly 4 digits')
        return v


class TransactionPINResponse(BaseModel):
    """
    Schema for transaction PIN status response.
    
    Attributes:
        has_pin: Whether user has set a PIN
        is_locked: Whether PIN is locked due to failed attempts
        locked_until: When PIN will be unlocked
    """
    has_pin: bool
    is_locked: bool = False
    locked_until: Optional[dt] = None
