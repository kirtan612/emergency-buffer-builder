-- Emergency Buffer Builder - Payment System Tables
-- Run this SQL in your PostgreSQL database to add payment features

-- Bank Accounts Table
CREATE TABLE IF NOT EXISTS bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_number VARCHAR(100) NOT NULL,
    ifsc_code VARCHAR(11) NOT NULL,
    account_holder_name VARCHAR(100) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    is_verified VARCHAR(20) DEFAULT 'pending' NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    is_primary VARCHAR(10) DEFAULT 'no' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);

-- UPI IDs Table
CREATE TABLE IF NOT EXISTS upi_ids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    upi_id VARCHAR(100) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    is_verified VARCHAR(20) DEFAULT 'pending' NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    is_primary VARCHAR(10) DEFAULT 'no' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_upi_ids_user_id ON upi_ids(user_id);

-- Payment Transactions Table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_reference VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
    upi_id UUID REFERENCES upi_ids(id) ON DELETE SET NULL,
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    failure_reason VARCHAR(255),
    receipt_url VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_payment_reference ON payment_transactions(payment_reference);

-- Transaction PINs Table
CREATE TABLE IF NOT EXISTS transaction_pins (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    pin_hash VARCHAR(255) NOT NULL,
    failed_attempts NUMERIC(2,0) DEFAULT 0 NOT NULL,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Payment system tables created successfully!';
    RAISE NOTICE 'You can now use bank accounts and UPI features.';
END $$;
