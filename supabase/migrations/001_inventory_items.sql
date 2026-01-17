-- ============================================================================
-- AIBLE DATABASE MIGRATION: INVENTORY ITEMS TABLE
-- ============================================================================
-- File: 001_inventory_items.sql
-- Created: 2026-01-17
-- Description: Creates the inventory_items table for tracking kitchen items
-- Dependencies: Requires Supabase Auth (auth.users table)
-- ============================================================================

-- Drop existing table if it exists (for development only)
DROP TABLE IF EXISTS public.inventory_items CASCADE;

-- ============================================================================
-- CREATE INVENTORY ITEMS TABLE
-- ============================================================================

CREATE TABLE public.inventory_items (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Item Details
  name TEXT NOT NULL,
  category TEXT,

  -- Quantity
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'piece',

  -- Dates
  expiry_date DATE,
  purchase_date DATE,

  -- Storage
  location TEXT NOT NULL DEFAULT 'pantry' CHECK (location IN ('fridge', 'freezer', 'pantry')),

  -- Additional Info
  barcode TEXT,
  image_url TEXT,
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for user-specific queries (most common)
CREATE INDEX idx_inventory_items_user_id ON public.inventory_items(user_id);

-- Index for expiry date queries (filtering expiring items)
CREATE INDEX idx_inventory_items_expiry ON public.inventory_items(expiry_date) WHERE expiry_date IS NOT NULL;

-- Index for category filtering
CREATE INDEX idx_inventory_items_category ON public.inventory_items(category) WHERE category IS NOT NULL;

-- Index for location filtering
CREATE INDEX idx_inventory_items_location ON public.inventory_items(location);

-- Index for barcode lookups
CREATE INDEX idx_inventory_items_barcode ON public.inventory_items(barcode) WHERE barcode IS NOT NULL;

-- Composite index for user + location queries
CREATE INDEX idx_inventory_items_user_location ON public.inventory_items(user_id, location);

-- Composite index for user + category queries
CREATE INDEX idx_inventory_items_user_category ON public.inventory_items(user_id, category) WHERE category IS NOT NULL;

-- ============================================================================
-- CREATE FUNCTION: AUTO-UPDATE TIMESTAMPS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CREATE TRIGGER: UPDATE TIMESTAMP ON ROW UPDATE
-- ============================================================================

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on the table
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view only their own inventory items
CREATE POLICY "Users can view own inventory items"
  ON public.inventory_items
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own inventory items
CREATE POLICY "Users can insert own inventory items"
  ON public.inventory_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update only their own inventory items
CREATE POLICY "Users can update own inventory items"
  ON public.inventory_items
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete only their own inventory items
CREATE POLICY "Users can delete own inventory items"
  ON public.inventory_items
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on the table to authenticated users
GRANT ALL ON public.inventory_items TO authenticated;
GRANT ALL ON public.inventory_items TO service_role;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.inventory_items IS 'Stores user kitchen inventory items with expiry tracking';
COMMENT ON COLUMN public.inventory_items.id IS 'Unique identifier for each inventory item';
COMMENT ON COLUMN public.inventory_items.user_id IS 'Reference to the user who owns this item';
COMMENT ON COLUMN public.inventory_items.name IS 'Name of the inventory item (e.g., "Milk", "Eggs")';
COMMENT ON COLUMN public.inventory_items.category IS 'Category of the item (e.g., "Dairy", "Vegetables")';
COMMENT ON COLUMN public.inventory_items.quantity IS 'Quantity of the item (supports decimals for measurements)';
COMMENT ON COLUMN public.inventory_items.unit IS 'Unit of measurement (e.g., "piece", "kg", "litre")';
COMMENT ON COLUMN public.inventory_items.expiry_date IS 'Expiration date of the item (nullable)';
COMMENT ON COLUMN public.inventory_items.purchase_date IS 'Date when the item was purchased (nullable)';
COMMENT ON COLUMN public.inventory_items.location IS 'Storage location: fridge, freezer, or pantry';
COMMENT ON COLUMN public.inventory_items.barcode IS 'Barcode number if scanned (nullable)';
COMMENT ON COLUMN public.inventory_items.image_url IS 'URL to item image (nullable)';
COMMENT ON COLUMN public.inventory_items.notes IS 'Additional notes about the item (nullable)';
COMMENT ON COLUMN public.inventory_items.created_at IS 'Timestamp when the item was created';
COMMENT ON COLUMN public.inventory_items.updated_at IS 'Timestamp when the item was last updated';

-- ============================================================================
-- VERIFICATION QUERIES (for testing)
-- ============================================================================

-- Verify table structure
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'inventory_items'
-- ORDER BY ordinal_position;

-- Verify indexes
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'inventory_items';

-- Verify RLS policies
-- SELECT policyname, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'inventory_items';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration 001_inventory_items.sql completed successfully';
  RAISE NOTICE 'Created table: public.inventory_items';
  RAISE NOTICE 'Created 8 indexes for performance optimization';
  RAISE NOTICE 'Enabled RLS with 4 security policies';
  RAISE NOTICE 'Table is ready for use!';
END $$;
