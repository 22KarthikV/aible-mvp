-- ============================================================================
-- AIBLE DATABASE MIGRATION: RECIPE MANAGEMENT SYSTEM
-- ============================================================================
-- File: 003_recipe_management.sql
-- Created: 2026-01-18
-- Description: Complete recipe management system with ingredients, instructions,
--              and user saved recipes tracking. Supports recipes from multiple
--              sources (manual, AI, API) with full inventory integration.
-- Dependencies: Requires auth.users and public.update_updated_at_column()
-- ============================================================================

-- ============================================================================
-- DROP EXISTING TABLES (for development iteration)
-- ============================================================================

DROP TABLE IF EXISTS public.recipe_tags CASCADE;
DROP TABLE IF EXISTS public.recipe_instructions CASCADE;
DROP TABLE IF EXISTS public.recipe_ingredients CASCADE;
DROP TABLE IF EXISTS public.user_saved_recipes CASCADE;
DROP TABLE IF EXISTS public.recipes CASCADE;

-- ============================================================================
-- TABLE 1: recipes
-- Purpose: Core recipe storage supporting multiple sources
-- ============================================================================

CREATE TABLE public.recipes (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Recipe Metadata
  title VARCHAR(255) NOT NULL,
  description TEXT,
  cuisine VARCHAR(100),

  -- Difficulty & Timing
  difficulty VARCHAR(20) NOT NULL DEFAULT 'medium'
    CHECK (difficulty IN ('easy', 'medium', 'hard')),
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  total_time_minutes INTEGER GENERATED ALWAYS AS (
    COALESCE(prep_time_minutes, 0) + COALESCE(cook_time_minutes, 0)
  ) STORED,

  -- Servings & Quantities
  servings INTEGER DEFAULT 1,

  -- Media
  image_url TEXT,

  -- Source Tracking
  source VARCHAR(50) NOT NULL DEFAULT 'manual'
    CHECK (source IN ('user', 'ai', 'spoonacular', 'manual')),
  source_id VARCHAR(255), -- External API ID if applicable

  -- Visibility
  is_public BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE 2: recipe_ingredients
-- Purpose: Individual ingredients for each recipe with inventory linking
-- ============================================================================

CREATE TABLE public.recipe_ingredients (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,

  -- Ingredient Details
  name VARCHAR(255) NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL, -- 'cups', 'grams', 'pieces', 'tsp', 'tbsp', 'ml', etc.

  -- Metadata
  is_optional BOOLEAN DEFAULT FALSE,
  notes TEXT,
  order_index INTEGER NOT NULL, -- Display order (1, 2, 3...)

  -- Inventory Linking
  inventory_match_id UUID REFERENCES public.inventory_items(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE 3: recipe_instructions
-- Purpose: Step-by-step cooking instructions
-- ============================================================================

CREATE TABLE public.recipe_instructions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,

  -- Instruction Details
  step_number INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  duration_minutes INTEGER, -- Optional: how long this step takes

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE 4: user_saved_recipes
-- Purpose: Track user's saved recipes with personal notes and history
-- ============================================================================

CREATE TABLE public.user_saved_recipes (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,

  -- User Metadata
  personal_notes TEXT,
  rating INTEGER CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  times_cooked INTEGER DEFAULT 0,
  last_cooked_at TIMESTAMPTZ,

  -- Timestamps
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, recipe_id) -- Users can only save a recipe once
);

-- ============================================================================
-- TABLE 5: recipe_tags
-- Purpose: Tag-based categorization (vegetarian, quick, breakfast, etc.)
-- ============================================================================

CREATE TABLE public.recipe_tags (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,

  -- Tag
  tag VARCHAR(50) NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(recipe_id, tag) -- Prevent duplicate tags per recipe
);

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Recipes Indexes
CREATE INDEX idx_recipes_user_id ON public.recipes(user_id);
CREATE INDEX idx_recipes_source ON public.recipes(source);
CREATE INDEX idx_recipes_cuisine ON public.recipes(cuisine) WHERE cuisine IS NOT NULL;
CREATE INDEX idx_recipes_difficulty ON public.recipes(difficulty);
CREATE INDEX idx_recipes_is_public ON public.recipes(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_recipes_created_at ON public.recipes(created_at);
CREATE INDEX idx_recipes_user_public ON public.recipes(user_id, is_public); -- Common query pattern

-- Recipe Ingredients Indexes
CREATE INDEX idx_recipe_ingredients_recipe_id ON public.recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_inventory_match ON public.recipe_ingredients(inventory_match_id);
CREATE INDEX idx_recipe_ingredients_order ON public.recipe_ingredients(recipe_id, order_index);

-- Recipe Instructions Indexes
CREATE INDEX idx_recipe_instructions_recipe_id ON public.recipe_instructions(recipe_id);
CREATE INDEX idx_recipe_instructions_step ON public.recipe_instructions(recipe_id, step_number);

-- User Saved Recipes Indexes
CREATE INDEX idx_user_saved_recipes_user_id ON public.user_saved_recipes(user_id);
CREATE INDEX idx_user_saved_recipes_recipe_id ON public.user_saved_recipes(recipe_id);
CREATE INDEX idx_user_saved_recipes_rating ON public.user_saved_recipes(user_id, rating)
  WHERE rating IS NOT NULL;
CREATE INDEX idx_user_saved_recipes_cooked ON public.user_saved_recipes(user_id, times_cooked)
  WHERE times_cooked > 0;
CREATE INDEX idx_user_saved_recipes_last_cooked ON public.user_saved_recipes(user_id, last_cooked_at)
  WHERE last_cooked_at IS NOT NULL;

-- Recipe Tags Indexes
CREATE INDEX idx_recipe_tags_recipe_id ON public.recipe_tags(recipe_id);
CREATE INDEX idx_recipe_tags_tag ON public.recipe_tags(tag);
CREATE INDEX idx_recipe_tags_user_tag ON public.recipe_tags(tag)
  INCLUDE (recipe_id); -- For tag-based discovery

-- ============================================================================
-- CREATE TRIGGERS: AUTO-UPDATE TIMESTAMPS
-- ============================================================================

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_saved_recipes_updated_at
  BEFORE UPDATE ON public.user_saved_recipes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all recipe tables
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_tags ENABLE ROW LEVEL SECURITY;

-- ===== RECIPES RLS POLICIES =====

-- Users can view:
-- 1. Their own recipes (private or public)
-- 2. All public recipes
CREATE POLICY "Users can view own and public recipes"
  ON public.recipes
  FOR SELECT
  USING (
    auth.uid() = user_id OR is_public = TRUE
  );

-- Users can insert their own recipes
CREATE POLICY "Users can insert own recipes"
  ON public.recipes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update only their own recipes
CREATE POLICY "Users can update own recipes"
  ON public.recipes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete only their own recipes
CREATE POLICY "Users can delete own recipes"
  ON public.recipes
  FOR DELETE
  USING (auth.uid() = user_id);

-- ===== RECIPE INGREDIENTS RLS POLICIES =====

-- Users can view ingredients of recipes they can view
CREATE POLICY "Users can view recipe ingredients"
  ON public.recipe_ingredients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = recipe_ingredients.recipe_id
      AND (recipes.user_id = auth.uid() OR recipes.is_public = TRUE)
    )
  );

-- Users can insert ingredients only for their own recipes
CREATE POLICY "Users can insert recipe ingredients"
  ON public.recipe_ingredients
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = recipe_ingredients.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- Users can update ingredients only for their own recipes
CREATE POLICY "Users can update recipe ingredients"
  ON public.recipe_ingredients
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = recipe_ingredients.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- Users can delete ingredients only from their own recipes
CREATE POLICY "Users can delete recipe ingredients"
  ON public.recipe_ingredients
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = recipe_ingredients.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- ===== RECIPE INSTRUCTIONS RLS POLICIES =====

-- Users can view instructions of recipes they can view
CREATE POLICY "Users can view recipe instructions"
  ON public.recipe_instructions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = recipe_instructions.recipe_id
      AND (recipes.user_id = auth.uid() OR recipes.is_public = TRUE)
    )
  );

-- Users can insert instructions only for their own recipes
CREATE POLICY "Users can insert recipe instructions"
  ON public.recipe_instructions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = recipe_instructions.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- Users can update instructions only for their own recipes
CREATE POLICY "Users can update recipe instructions"
  ON public.recipe_instructions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = recipe_instructions.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- Users can delete instructions only from their own recipes
CREATE POLICY "Users can delete recipe instructions"
  ON public.recipe_instructions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = recipe_instructions.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- ===== USER SAVED RECIPES RLS POLICIES =====

-- Users can view only their own saved recipes list
CREATE POLICY "Users can view own saved recipes"
  ON public.user_saved_recipes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can save only their own recipes
CREATE POLICY "Users can save recipes"
  ON public.user_saved_recipes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update only their own saved recipe data
CREATE POLICY "Users can update own saved recipes"
  ON public.user_saved_recipes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete only their own saved recipes
CREATE POLICY "Users can delete own saved recipes"
  ON public.user_saved_recipes
  FOR DELETE
  USING (auth.uid() = user_id);

-- ===== RECIPE TAGS RLS POLICIES =====

-- Users can view tags of recipes they can view
CREATE POLICY "Users can view recipe tags"
  ON public.recipe_tags
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = recipe_tags.recipe_id
      AND (recipes.user_id = auth.uid() OR recipes.is_public = TRUE)
    )
  );

-- Users can insert tags only for their own recipes
CREATE POLICY "Users can insert recipe tags"
  ON public.recipe_tags
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = recipe_tags.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- Users can delete tags only from their own recipes
CREATE POLICY "Users can delete recipe tags"
  ON public.recipe_tags
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = recipe_tags.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT ALL ON public.recipes TO authenticated;
GRANT ALL ON public.recipe_ingredients TO authenticated;
GRANT ALL ON public.recipe_instructions TO authenticated;
GRANT ALL ON public.user_saved_recipes TO authenticated;
GRANT ALL ON public.recipe_tags TO authenticated;

GRANT ALL ON public.recipes TO service_role;
GRANT ALL ON public.recipe_ingredients TO service_role;
GRANT ALL ON public.recipe_instructions TO service_role;
GRANT ALL ON public.user_saved_recipes TO service_role;
GRANT ALL ON public.recipe_tags TO service_role;

-- ============================================================================
-- DOCUMENTATION & COMMENTS
-- ============================================================================

COMMENT ON TABLE public.recipes IS 'Core recipe storage with support for multiple sources (user, AI, API)';
COMMENT ON TABLE public.recipe_ingredients IS 'Individual ingredients for recipes with inventory linking capability';
COMMENT ON TABLE public.recipe_instructions IS 'Step-by-step cooking instructions for recipes';
COMMENT ON TABLE public.user_saved_recipes IS 'User''s saved recipes with personal notes, ratings, and cooking history';
COMMENT ON TABLE public.recipe_tags IS 'Tags for recipe categorization (vegetarian, quick, breakfast, etc.)';

COMMENT ON COLUMN public.recipes.id IS 'Unique identifier for each recipe';
COMMENT ON COLUMN public.recipes.user_id IS 'User who created/owns the recipe (NULL for global recipes)';
COMMENT ON COLUMN public.recipes.title IS 'Recipe name/title';
COMMENT ON COLUMN public.recipes.description IS 'Long-form recipe description';
COMMENT ON COLUMN public.recipes.cuisine IS 'Cuisine type (Italian, Mexican, Asian, etc.)';
COMMENT ON COLUMN public.recipes.difficulty IS 'Skill level required: easy, medium, or hard';
COMMENT ON COLUMN public.recipes.prep_time_minutes IS 'Prep time in minutes';
COMMENT ON COLUMN public.recipes.cook_time_minutes IS 'Cook time in minutes';
COMMENT ON COLUMN public.recipes.total_time_minutes IS 'Total time (auto-calculated from prep + cook)';
COMMENT ON COLUMN public.recipes.servings IS 'Number of servings the recipe makes';
COMMENT ON COLUMN public.recipes.image_url IS 'URL to recipe image (Supabase Storage path)';
COMMENT ON COLUMN public.recipes.source IS 'Source: user (manual), ai (Gemini), spoonacular (API), manual (input form)';
COMMENT ON COLUMN public.recipes.source_id IS 'External API ID if from third-party source';
COMMENT ON COLUMN public.recipes.is_public IS 'Whether recipe is discoverable by other users';
COMMENT ON COLUMN public.recipes.created_at IS 'Timestamp when recipe was created';
COMMENT ON COLUMN public.recipes.updated_at IS 'Timestamp when recipe was last modified';

COMMENT ON COLUMN public.recipe_ingredients.recipe_id IS 'Reference to parent recipe';
COMMENT ON COLUMN public.recipe_ingredients.name IS 'Ingredient name (e.g., "Chicken breast", "Olive oil")';
COMMENT ON COLUMN public.recipe_ingredients.quantity IS 'Amount needed';
COMMENT ON COLUMN public.recipe_ingredients.unit IS 'Unit of measurement (cups, grams, pieces, tsp, tbsp, ml, etc.)';
COMMENT ON COLUMN public.recipe_ingredients.is_optional IS 'Whether ingredient is optional or required';
COMMENT ON COLUMN public.recipe_ingredients.notes IS 'Special preparation notes (diced, minced, melted, etc.)';
COMMENT ON COLUMN public.recipe_ingredients.order_index IS 'Display order in ingredient list';
COMMENT ON COLUMN public.recipe_ingredients.inventory_match_id IS 'Link to matching inventory item for shopping/availability checking';

COMMENT ON COLUMN public.recipe_instructions.recipe_id IS 'Reference to parent recipe';
COMMENT ON COLUMN public.recipe_instructions.step_number IS 'Step sequence (1, 2, 3...)';
COMMENT ON COLUMN public.recipe_instructions.instruction IS 'Detailed instruction text';
COMMENT ON COLUMN public.recipe_instructions.duration_minutes IS 'Time this step takes (optional)';

COMMENT ON COLUMN public.user_saved_recipes.user_id IS 'User who saved this recipe';
COMMENT ON COLUMN public.user_saved_recipes.recipe_id IS 'The saved recipe';
COMMENT ON COLUMN public.user_saved_recipes.personal_notes IS 'User''s personal notes/modifications';
COMMENT ON COLUMN public.user_saved_recipes.rating IS 'User''s 1-5 star rating (NULL if not rated)';
COMMENT ON COLUMN public.user_saved_recipes.times_cooked IS 'Number of times user has cooked this recipe';
COMMENT ON COLUMN public.user_saved_recipes.last_cooked_at IS 'Timestamp of last time user cooked this recipe';
COMMENT ON COLUMN public.user_saved_recipes.saved_at IS 'When the recipe was saved to user''s collection';
COMMENT ON COLUMN public.user_saved_recipes.updated_at IS 'When saved recipe metadata was last updated';

COMMENT ON COLUMN public.recipe_tags.recipe_id IS 'Reference to parent recipe';
COMMENT ON COLUMN public.recipe_tags.tag IS 'Tag value (vegetarian, vegan, quick, breakfast, etc.)';

-- ============================================================================
-- VERIFICATION QUERIES (for testing - can be commented out)
-- ============================================================================

-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name IN ('recipes', 'recipe_ingredients', 'recipe_instructions', 'user_saved_recipes', 'recipe_tags')
-- ORDER BY table_name, ordinal_position;

-- SELECT indexname, indexdef FROM pg_indexes
-- WHERE tablename IN ('recipes', 'recipe_ingredients', 'recipe_instructions', 'user_saved_recipes', 'recipe_tags');

-- SELECT policyname, cmd, qual, with_check FROM pg_policies
-- WHERE tablename IN ('recipes', 'recipe_ingredients', 'recipe_instructions', 'user_saved_recipes', 'recipe_tags');

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 003_recipe_management.sql completed successfully';
  RAISE NOTICE 'Created 5 tables: recipes, recipe_ingredients, recipe_instructions, user_saved_recipes, recipe_tags';
  RAISE NOTICE 'Created 17 indexes for optimized queries';
  RAISE NOTICE 'Enabled RLS with comprehensive security policies';
  RAISE NOTICE 'Recipe Management System ready for use!';
END $$;
