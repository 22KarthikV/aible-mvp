-- ============================================================================
-- SAMPLE DATA FOR TESTING INVENTORY SYSTEM
-- ============================================================================
-- File: SAMPLE_DATA.sql
-- Description: Sample inventory items for testing the Aible inventory system
-- Usage: Run this AFTER running 001_inventory_items.sql migration
-- Note: Replace auth.uid() with your actual user ID if needed
-- ============================================================================

-- ============================================================================
-- INSERT SAMPLE INVENTORY ITEMS
-- ============================================================================

-- DAIRY PRODUCTS
INSERT INTO public.inventory_items (user_id, name, category, quantity, unit, location, expiry_date, purchase_date, notes) VALUES
(auth.uid(), 'Whole Milk', 'Dairy', 2, 'litre', 'fridge', CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE - INTERVAL '1 day', 'Organic, from local farm'),
(auth.uid(), 'Greek Yogurt', 'Dairy', 500, 'gram', 'fridge', CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE - INTERVAL '2 days', '0% fat'),
(auth.uid(), 'Cheddar Cheese', 'Dairy', 250, 'gram', 'fridge', CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE - INTERVAL '5 days', 'Mature cheddar'),
(auth.uid(), 'Butter', 'Dairy', 250, 'gram', 'fridge', CURRENT_DATE + INTERVAL '45 days', CURRENT_DATE - INTERVAL '3 days', 'Unsalted');

-- FRUITS (Some Expiring Soon)
INSERT INTO public.inventory_items (user_id, name, category, quantity, unit, location, expiry_date, purchase_date, notes) VALUES
(auth.uid(), 'Bananas', 'Fruits', 6, 'piece', 'pantry', CURRENT_DATE + INTERVAL '3 days', CURRENT_DATE, 'Turning brown soon'),
(auth.uid(), 'Apples', 'Fruits', 8, 'piece', 'fridge', CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE - INTERVAL '2 days', 'Granny Smith'),
(auth.uid(), 'Strawberries', 'Fruits', 250, 'gram', 'fridge', CURRENT_DATE + INTERVAL '2 days', CURRENT_DATE, 'Fresh from market');

-- VEGETABLES
INSERT INTO public.inventory_items (user_id, name, category, quantity, unit, location, expiry_date, purchase_date, notes) VALUES
(auth.uid(), 'Carrots', 'Vegetables', 1, 'kg', 'fridge', CURRENT_DATE + INTERVAL '20 days', CURRENT_DATE - INTERVAL '3 days', NULL),
(auth.uid(), 'Broccoli', 'Vegetables', 500, 'gram', 'fridge', CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE - INTERVAL '1 day', NULL),
(auth.uid(), 'Onions', 'Vegetables', 1.5, 'kg', 'pantry', CURRENT_DATE + INTERVAL '60 days', CURRENT_DATE - INTERVAL '7 days', 'Red onions'),
(auth.uid(), 'Tomatoes', 'Vegetables', 6, 'piece', 'pantry', CURRENT_DATE + INTERVAL '4 days', CURRENT_DATE, 'Cherry tomatoes');

-- MEAT (Some Frozen)
INSERT INTO public.inventory_items (user_id, name, category, quantity, unit, location, expiry_date, purchase_date, notes) VALUES
(auth.uid(), 'Chicken Breast', 'Meat', 800, 'gram', 'fridge', CURRENT_DATE + INTERVAL '3 days', CURRENT_DATE - INTERVAL '1 day', 'Use soon or freeze'),
(auth.uid(), 'Ground Beef', 'Meat', 500, 'gram', 'freezer', CURRENT_DATE + INTERVAL '90 days', CURRENT_DATE - INTERVAL '2 days', 'Frozen, 15% fat'),
(auth.uid(), 'Salmon Fillets', 'Seafood', 400, 'gram', 'freezer', CURRENT_DATE + INTERVAL '120 days', CURRENT_DATE - INTERVAL '5 days', 'Wild caught, frozen');

-- GRAINS & BREAD
INSERT INTO public.inventory_items (user_id, name, category, quantity, unit, location, expiry_date, purchase_date, notes) VALUES
(auth.uid(), 'Whole Wheat Bread', 'Bakery', 1, 'loaf', 'pantry', CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE - INTERVAL '1 day', 'Sliced'),
(auth.uid(), 'Brown Rice', 'Grains', 2, 'kg', 'pantry', CURRENT_DATE + INTERVAL '365 days', CURRENT_DATE - INTERVAL '30 days', 'Unopened package'),
(auth.uid(), 'Pasta', 'Grains', 500, 'gram', 'pantry', CURRENT_DATE + INTERVAL '730 days', CURRENT_DATE - INTERVAL '60 days', 'Spaghetti');

-- PANTRY STAPLES
INSERT INTO public.inventory_items (user_id, name, category, quantity, unit, location, expiry_date, purchase_date, notes) VALUES
(auth.uid(), 'Olive Oil', 'Condiments', 500, 'ml', 'pantry', CURRENT_DATE + INTERVAL '365 days', CURRENT_DATE - INTERVAL '45 days', 'Extra virgin'),
(auth.uid(), 'Honey', 'Condiments', 340, 'gram', 'pantry', NULL, CURRENT_DATE - INTERVAL '90 days', 'Never expires!'),
(auth.uid(), 'Canned Tomatoes', 'Canned Goods', 400, 'gram', 'pantry', CURRENT_DATE + INTERVAL '730 days', CURRENT_DATE - INTERVAL '120 days', 'Chopped tomatoes');

-- BEVERAGES
INSERT INTO public.inventory_items (user_id, name, category, quantity, unit, location, expiry_date, purchase_date, notes) VALUES
(auth.uid(), 'Orange Juice', 'Beverages', 1, 'litre', 'fridge', CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE, 'Fresh squeezed'),
(auth.uid(), 'Coffee Beans', 'Beverages', 250, 'gram', 'pantry', CURRENT_DATE + INTERVAL '90 days', CURRENT_DATE - INTERVAL '10 days', 'Arabica, medium roast');

-- FROZEN ITEMS
INSERT INTO public.inventory_items (user_id, name, category, quantity, unit, location, expiry_date, purchase_date, notes) VALUES
(auth.uid(), 'Frozen Peas', 'Frozen', 500, 'gram', 'freezer', CURRENT_DATE + INTERVAL '180 days', CURRENT_DATE - INTERVAL '30 days', NULL),
(auth.uid(), 'Ice Cream', 'Frozen', 500, 'ml', 'freezer', CURRENT_DATE + INTERVAL '60 days', CURRENT_DATE - INTERVAL '7 days', 'Vanilla');

-- EXPIRED ITEM (For testing expired status)
INSERT INTO public.inventory_items (user_id, name, category, quantity, unit, location, expiry_date, purchase_date, notes) VALUES
(auth.uid(), 'Expired Yogurt', 'Dairy', 150, 'gram', 'fridge', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE - INTERVAL '14 days', 'NEEDS TO BE THROWN OUT!');

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Count total items
SELECT COUNT(*) as total_items FROM public.inventory_items WHERE user_id = auth.uid();

-- Check items by location
SELECT location, COUNT(*) as count
FROM public.inventory_items
WHERE user_id = auth.uid()
GROUP BY location
ORDER BY count DESC;

-- Check expiring soon items (within 7 days)
SELECT name, expiry_date,
       (expiry_date - CURRENT_DATE) as days_until_expiry
FROM public.inventory_items
WHERE user_id = auth.uid()
  AND expiry_date IS NOT NULL
  AND expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
ORDER BY expiry_date ASC;

-- Check expired items
SELECT name, expiry_date,
       (CURRENT_DATE - expiry_date) as days_expired
FROM public.inventory_items
WHERE user_id = auth.uid()
  AND expiry_date IS NOT NULL
  AND expiry_date < CURRENT_DATE
ORDER BY expiry_date ASC;

-- ============================================================================
-- CLEANUP (Optional - removes all sample data)
-- ============================================================================

-- Uncomment to delete all sample data:
-- DELETE FROM public.inventory_items WHERE user_id = auth.uid();

-- ============================================================================
-- SAMPLE DATA LOADED
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Sample data loaded successfully!';
  RAISE NOTICE 'Total items: 24';
  RAISE NOTICE 'Locations: Fridge (11), Freezer (4), Pantry (9)';
  RAISE NOTICE 'Categories: Dairy, Fruits, Vegetables, Meat, Seafood, Bakery, Grains, Condiments, Canned Goods, Beverages, Frozen';
  RAISE NOTICE 'Expiry status: Fresh, Expiring Soon, and Expired items included for testing';
END $$;
