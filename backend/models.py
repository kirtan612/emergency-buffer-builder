"""
SQLAlchemy models for Emergency Buffer Builder.

This module defines all database models including User, Transaction,
EmergencyFund, and Insight tables with their relationships and constraints.
"""

from sqlalchemy import Column, String, Numeric, DateTime, Date, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid


class User(Base):
    """
    User model representing a student using the Emergency Buffer Builder app.
    
    Attributes:
        id: Unique identifier (UUID)
        name: Full name of the user
        email: Email address (unique, indexed)
        password_hash: Hashed password for authentication
        monthly_allowance: User's monthly budget/allowance
        created_at: Timestamp of account creation
        
    Relationships:
        transactions: All transactions made by this user
        emergency_fund: User's emergency fund details
        insights: Calculated financial insights for this user
    """
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    monthly_allowance = Column(Numeric(10, 2), default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    emergency_fund = relationship("EmergencyFund", back_populates="user", uselist=False, cascade="all, delete-orphan")
    insights = relationship("Insight", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, name={self.name})>"


class Transaction(Base):
    """
    Transaction model representing income or expense entries.
    
    Attributes:
        id: Unique identifier (UUID)
        user_id: Foreign key to User
        amount: Transaction amount (negative for expenses, positive for income)
        category: Category of transaction (e.g., food, transport, education)
        description: Optional description of the transaction
        date: Date when the transaction occurred
        created_at: Timestamp when the transaction was logged
        
    Relationships:
        user: The user who made this transaction
        
    Indexes:
        - Composite index on (user_id, date) for efficient date-range queries
    """
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    category = Column(String(50), nullable=False)
    description = Column(String(255), nullable=True)
    date = Column(Date, nullable=False, server_default=func.current_date())
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="transactions")

    # Indexes
    __table_args__ = (
        Index("idx_user_date", "user_id", "date"),
    )

    def __repr__(self):
        return f"<Transaction(id={self.id}, user_id={self.user_id}, amount={self.amount}, category={self.category})>"


class EmergencyFund(Base):
    """
    EmergencyFund model representing a user's emergency savings vault.
    
    Attributes:
        user_id: Primary key and foreign key to User (one-to-one relationship)
        total_amount: Current balance in the emergency fund
        locked_until: Optional datetime until which withdrawals are locked
        
    Relationships:
        user: The user who owns this emergency fund
        
    Note:
        The Vault Lock feature uses locked_until to prevent withdrawals
        during the commitment period.
    """
    __tablename__ = "emergency_funds"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    total_amount = Column(Numeric(10, 2), default=0, nullable=False)
    locked_until = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="emergency_fund")

    def __repr__(self):
        return f"<EmergencyFund(user_id={self.user_id}, total_amount={self.total_amount}, locked_until={self.locked_until})>"


class Insight(Base):
    """
    Insight model storing calculated financial metrics for a user.
    
    Attributes:
        id: Unique identifier (UUID)
        user_id: Foreign key to User
        avg_daily_spending: Average daily spending over the last 30 days
        survival_days: Number of days the emergency fund can sustain the user
        risk_level: Risk classification (Safe, Warning, Critical)
        calculated_at: Timestamp when these insights were calculated
        
    Relationships:
        user: The user these insights belong to
        
    Note:
        Insights are recalculated after each transaction to provide
        real-time financial health monitoring.
    """
    __tablename__ = "insights"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    avg_daily_spending = Column(Numeric(10, 2), default=0, nullable=False)
    survival_days = Column(Numeric(6, 2), default=0, nullable=False)
    risk_level = Column(String(20), default="Safe", nullable=False)
    calculated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="insights")

    def __repr__(self):
        return f"<Insight(id={self.id}, user_id={self.user_id}, survival_days={self.survival_days}, risk_level={self.risk_level})>"


class BankAccount(Base):
    """
    BankAccount model for storing user's linked bank accounts.
    
    Attributes:
        id: Unique identifier (UUID)
        user_id: Foreign key to User
        account_number: Encrypted bank account number
        ifsc_code: Bank IFSC code
        account_holder_name: Name as per bank account
        bank_name: Name of the bank
        is_verified: Whether account is verified via penny drop
        verified_at: Timestamp of verification
        is_primary: Whether this is the primary account for withdrawals
        created_at: Timestamp when account was added
        
    Relationships:
        user: The user who owns this bank account
        payment_transactions: Payments made to/from this account
    """
    __tablename__ = "bank_accounts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    account_number = Column(String(100), nullable=False)  # Encrypted in production
    ifsc_code = Column(String(11), nullable=False)
    account_holder_name = Column(String(100), nullable=False)
    bank_name = Column(String(100), nullable=False)
    is_verified = Column(String(20), default="pending", nullable=False)  # pending, verified, failed
    verified_at = Column(DateTime(timezone=True), nullable=True)
    is_primary = Column(String(10), default="no", nullable=False)  # yes, no
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", backref="bank_accounts")
    payment_transactions = relationship("PaymentTransaction", back_populates="bank_account")

    def __repr__(self):
        return f"<BankAccount(id={self.id}, user_id={self.user_id}, bank_name={self.bank_name}, verified={self.is_verified})>"


class UPIId(Base):
    """
    UPIId model for storing user's linked UPI IDs.
    
    Attributes:
        id: Unique identifier (UUID)
        user_id: Foreign key to User
        upi_id: UPI ID (e.g., user@paytm, user@phonepe)
        provider: UPI provider (paytm, phonepe, gpay, etc.)
        is_verified: Whether UPI ID is verified
        verified_at: Timestamp of verification
        is_primary: Whether this is the primary UPI for deposits
        created_at: Timestamp when UPI was added
        
    Relationships:
        user: The user who owns this UPI ID
        payment_transactions: Payments made via this UPI
    """
    __tablename__ = "upi_ids"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    upi_id = Column(String(100), nullable=False)
    provider = Column(String(50), nullable=False)  # paytm, phonepe, gpay, bhim, etc.
    is_verified = Column(String(20), default="pending", nullable=False)  # pending, verified, failed
    verified_at = Column(DateTime(timezone=True), nullable=True)
    is_primary = Column(String(10), default="no", nullable=False)  # yes, no
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", backref="upi_ids")
    payment_transactions = relationship("PaymentTransaction", back_populates="upi")

    def __repr__(self):
        return f"<UPIId(id={self.id}, user_id={self.user_id}, upi_id={self.upi_id}, provider={self.provider})>"


class PaymentTransaction(Base):
    """
    PaymentTransaction model for tracking all payment operations.
    
    Attributes:
        id: Unique identifier (UUID)
        user_id: Foreign key to User
        transaction_type: Type of transaction (deposit, withdrawal)
        amount: Transaction amount
        payment_method: Method used (upi, bank_transfer, card)
        payment_reference: External payment reference (UPI ref, transaction ID)
        status: Transaction status (pending, processing, success, failed)
        bank_account_id: Foreign key to BankAccount (if bank transfer)
        upi_id: Foreign key to UPIId (if UPI payment)
        initiated_at: When transaction was initiated
        completed_at: When transaction was completed
        failure_reason: Reason if transaction failed
        receipt_url: URL to downloadable receipt
        
    Relationships:
        user: The user who initiated this payment
        bank_account: Bank account used (if applicable)
        upi: UPI ID used (if applicable)
    """
    __tablename__ = "payment_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    transaction_type = Column(String(20), nullable=False)  # deposit, withdrawal
    amount = Column(Numeric(15, 2), nullable=False)
    payment_method = Column(String(50), nullable=False)  # upi, bank_transfer, card
    payment_reference = Column(String(100), nullable=True)  # External ref number
    status = Column(String(20), default="pending", nullable=False)  # pending, processing, success, failed
    bank_account_id = Column(UUID(as_uuid=True), ForeignKey("bank_accounts.id", ondelete="SET NULL"), nullable=True)
    upi_id = Column(UUID(as_uuid=True), ForeignKey("upi_ids.id", ondelete="SET NULL"), nullable=True)
    initiated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    failure_reason = Column(String(255), nullable=True)
    receipt_url = Column(String(255), nullable=True)

    # Relationships
    user = relationship("User", backref="payment_transactions")
    bank_account = relationship("BankAccount", back_populates="payment_transactions")
    upi = relationship("UPIId", back_populates="payment_transactions")

    # Indexes
    __table_args__ = (
        Index("idx_user_payment_status", "user_id", "status"),
        Index("idx_payment_reference", "payment_reference"),
    )

    def __repr__(self):
        return f"<PaymentTransaction(id={self.id}, type={self.transaction_type}, amount={self.amount}, status={self.status})>"


class TransactionPIN(Base):
    """
    TransactionPIN model for storing user's transaction PIN for payment security.
    
    Attributes:
        user_id: Primary key and foreign key to User
        pin_hash: Hashed 4-digit PIN
        failed_attempts: Number of consecutive failed attempts
        locked_until: Timestamp until which PIN is locked (after too many failures)
        created_at: When PIN was created
        updated_at: When PIN was last updated
        
    Relationships:
        user: The user who owns this PIN
        
    Security:
        - PIN is hashed using bcrypt
        - Locked for 30 minutes after 3 failed attempts
        - Must be reset via OTP if forgotten
    """
    __tablename__ = "transaction_pins"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    pin_hash = Column(String(255), nullable=False)
    failed_attempts = Column(Numeric(2, 0), default=0, nullable=False)
    locked_until = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", backref="transaction_pin", uselist=False)

    def __repr__(self):
        return f"<TransactionPIN(user_id={self.user_id}, failed_attempts={self.failed_attempts})>"
