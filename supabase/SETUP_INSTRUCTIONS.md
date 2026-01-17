# Supabase Database Setup Instructions

## Overview

This guide will help you set up the Aible database schema in your Supabase project.

---

## Prerequisites

- ✅ Supabase project created (you already have this)
- ✅ Supabase project URL and Anon Key configured in `.env.local`
- ✅ Database password backed up to OneDrive

---

## Step 1: Access Supabase SQL Editor

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your **"aible-mvp"** project
3. Navigate to **SQL Editor** in the left sidebar (icon looks like `</>`)

---

## Step 2: Run Migration 001 - Inventory Items Table

### Option A: Copy-Paste Method (Recommended)

1. Click **"New Query"** button in SQL Editor
2. Open the file: `supabase/migrations/001_inventory_items.sql`
3. **Copy the entire content** of the file
4. **Paste** into the SQL Editor
5. Click **"Run"** button (or press `Ctrl+Enter`)

### Option B: Upload File Method

1. In SQL Editor, click the **"..."** menu
2. Select **"Upload SQL file"**
3. Choose `supabase/migrations/001_inventory_items.sql`
4. Click **"Run"**

---

## Step 3: Verify Migration Success

You should see success messages at the bottom of the SQL Editor:

```
Migration 001_inventory_items.sql completed successfully
Created table: public.inventory_items
Created 8 indexes for performance optimization
Enabled RLS with 4 security policies
Table is ready for use!
```

---

## Step 4: Verify Table Structure

Run this query to check the table was created correctly:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'inventory_items'
ORDER BY ordinal_position;
```

You should see 14 columns:
- `id` (uuid)
- `user_id` (uuid)
- `name` (text)
- `category` (text)
- `quantity` (numeric)
- `unit` (text)
- `expiry_date` (date)
- `purchase_date` (date)
- `location` (text)
- `barcode` (text)
- `image_url` (text)
- `notes` (text)
- `created_at` (timestamp with time zone)
- `updated_at` (timestamp with time zone)

---

## Step 5: Verify RLS Policies

Run this query to check Row Level Security is enabled:

```sql
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'inventory_items';
```

You should see 4 policies:
- ✅ **Users can view own inventory items** (SELECT)
- ✅ **Users can insert own inventory items** (INSERT)
- ✅ **Users can update own inventory items** (UPDATE)
- ✅ **Users can delete own inventory items** (DELETE)

---

## Step 6: Test with Sample Data (Optional)

Add a test inventory item:

```sql
-- Insert a sample item (replace 'your-user-id' with your actual auth.uid())
INSERT INTO public.inventory_items (
  user_id,
  name,
  category,
  quantity,
  unit,
  location,
  expiry_date,
  purchase_date,
  notes
) VALUES (
  auth.uid(), -- Uses your current authenticated user ID
  'Milk',
  'Dairy',
  1,
  'litre',
  'fridge',
  CURRENT_DATE + INTERVAL '7 days', -- Expires in 7 days
  CURRENT_DATE,
  'Test item from SQL Editor'
);

-- Verify the item was inserted
SELECT * FROM public.inventory_items
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 1;
```

---

## Step 7: Return to Your App

1. Go back to your Aible app: **http://localhost:5174/inventory**
2. Refresh the page
3. The 404 errors should be gone!
4. If you added test data, you should see your test item in the inventory

---

## Troubleshooting

### Error: "permission denied for table inventory_items"

**Solution**: Make sure you're authenticated in your app. The RLS policies require a valid user session.

### Error: "relation 'inventory_items' does not exist"

**Solution**: The migration didn't run successfully. Go back to Step 2 and run the migration again.

### Error: "duplicate key value violates unique constraint"

**Solution**: The table already exists. You can either:
- Drop the table first: `DROP TABLE IF EXISTS public.inventory_items CASCADE;`
- Or skip the migration if the table structure matches

---

## What This Migration Does

### Creates:
- ✅ `inventory_items` table with 14 columns
- ✅ 8 performance-optimized indexes
- ✅ Auto-updating `updated_at` timestamp trigger
- ✅ 4 Row Level Security (RLS) policies for data protection

### Security:
- 🔒 Users can ONLY see their own inventory items
- 🔒 Users can ONLY modify their own inventory items
- 🔒 Data is protected even if someone gets direct database access

### Performance:
- ⚡ Fast queries with indexed columns
- ⚡ Optimized for filtering by category, location, expiry date
- ⚡ Efficient barcode lookups

---

## Next Steps

Once the migration is complete and verified:

1. ✅ Test the Aible inventory system at **http://localhost:5174/inventory**
2. ✅ Add items manually or via barcode scanner
3. ✅ Verify filtering and search functionality
4. ✅ Check expiry status indicators work correctly

---

## Need Help?

If you encounter any issues:
1. Check the Supabase logs: **Logs** section in left sidebar
2. Verify environment variables in `.env.local`
3. Ensure you're signed in to the Aible app
4. Check browser console for errors (F12 → Console tab)

---

**Migration File**: `supabase/migrations/001_inventory_items.sql`
**Created**: 2026-01-17
**Status**: Ready to run
