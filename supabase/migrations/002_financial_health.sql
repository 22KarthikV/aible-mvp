-- ============================================================================
-- AIBLE DATABASE MIGRATION: FINANCIAL HEALTH (PRO FEATURE)
-- ============================================================================
-- File: 002_financial_health.sql
-- Created: 2026-01-17
-- Description: Adds budgeting and transaction tracking for the Financial Health module
-- Dependencies: Requires auth.users
-- ============================================================================

-- ⚠️ RESET: Drop tables if they exist (for development iteration)
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.user_budgets CASCADE;

-- ============================================================================
-- TABLE 1: user_budgets
-- Purpose: Configuration for user spending limits and alerts
-- ============================================================================

CREATE TABLE public.user_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Budget Configuration
  monthly_limit NUMERIC(10, 2) NOT NULL DEFAULT 500.00,
  currency TEXT NOT NULL DEFAULT 'GBP', -- 'USD', 'EUR', etc.
  
  -- Settings
  alert_threshold INTEGER DEFAULT 80, -- Notify when 80% of budget is used
  rollover_savings BOOLEAN DEFAULT FALSE, -- Does unused budget roll over?
  budget_start_day INTEGER DEFAULT 1 CHECK (budget_start_day BETWEEN 1 AND 31),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure one budget config per user
  UNIQUE(user_id)
);

-- ============================================================================
-- TABLE 2: transactions
-- Purpose: Log of spending events (usually from receipts)
-- ============================================================================

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Transaction Details
  store_name TEXT NOT NULL,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  
  -- Analysis Data (JSONB for flexibility)
  -- Structure: { "dairy": 12.50, "produce": 5.00, "snacks": 2.99 }
  category_breakdown JSONB DEFAULT '{}'::jsonb,
  
  -- Receipt Link (optional, could link to image storage path)
  receipt_image_path TEXT,
  
  -- Metadata
  is_verified BOOLEAN DEFAULT TRUE, -- If user confirmed the OCR data
  source TEXT CHECK (source IN ('scan', 'manual', 'import')),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES & TRIGGERS
-- ============================================================================

-- Indexes
CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, transaction_date);
CREATE INDEX idx_transactions_store ON public.transactions(user_id, store_name);

-- Triggers for updated_at
-- Note: Assuming update_updated_at_column function exists from previous migration
CREATE TRIGGER update_user_budgets_modtime
  BEFORE UPDATE ON public.user_budgets
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_transactions_modtime
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.user_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- User Budgets Policies
CREATE POLICY "Users can view own budget" ON public.user_budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own budget" ON public.user_budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budget" ON public.user_budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transactions Policies
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.user_budgets IS 'Stores user monthly budget settings for the Financial Health module';
COMMENT ON TABLE public.transactions IS 'Logs spending history derived from receipts or manual entry';