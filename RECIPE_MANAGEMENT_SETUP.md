# Recipe Management System - Complete Setup Guide

## Overview

This document describes the complete Recipe Management System for the Aible kitchen assistant application. The system supports creating, saving, and discovering recipes from multiple sources (user-created, AI-generated, API sources) with full inventory integration.

---

## Architecture & Data Model

### Core Tables

#### 1. `recipes` (Primary Recipe Storage)
- Stores all recipes from multiple sources
- Supports public/private visibility
- Auto-calculates `total_time_minutes` from prep + cook times
- Fields: title, description, cuisine, difficulty, timing, servings, image, source tracking

#### 2. `recipe_ingredients` (Individual Ingredients)
- Each ingredient is a separate row (normalized structure)
- Supports optional ingredients and special notes
- Can link to `inventory_items` for availability checking
- Order preserved via `order_index`

#### 3. `recipe_instructions` (Cooking Steps)
- Sequential steps with optional duration estimates
- Ordered by `step_number`
- Enables better cooking timeline planning

#### 4. `user_saved_recipes` (User Recipe Collection)
- Junction table linking users to recipes
- Tracks personal notes, ratings, cooking history
- Unique constraint ensures no duplicate saves
- Fields: rating (1-5), times_cooked, last_cooked_at

#### 5. `recipe_tags` (Flexible Categorization)
- Tag-based system for discovery (vegetarian, quick, breakfast, etc.)
- Unique constraint prevents duplicate tags per recipe
- Enables tag-based search and filtering

### Inventory Integration

Recipes link to inventory items through `recipe_ingredients.inventory_match_id`:

```sql
-- Link a recipe ingredient to an inventory item
UPDATE recipe_ingredients
SET inventory_match_id = $1
WHERE id = $2;
```

This enables:
- "Check what you have" feature
- Auto-population of shopping lists
- Missing ingredient detection
- Availability warnings

---

## Database Migration

### Applying the Migration

```bash
# The migration file is located at:
supabase/migrations/003_recipe_management.sql

# Apply via Supabase CLI:
supabase db push

# Or manually in Supabase dashboard SQL editor
```

### What Gets Created

```
Tables:
  - public.recipes
  - public.recipe_ingredients
  - public.recipe_instructions
  - public.user_saved_recipes
  - public.recipe_tags

Indexes: 17 indexes for optimized queries
RLS Policies: Comprehensive security policies
Triggers: Auto-update timestamps
```

---

## TypeScript Types

All types are defined in `src/types/database.ts`:

### Key Types for Development

```typescript
// Base recipe type
import { Recipe, RecipeInput, RecipeUpdate } from '@/types/database';

// Recipe with full details (ingredients + instructions + tags)
import { RecipeWithDetails } from '@/types/database';

// Ingredient row from database
import { RecipeIngredientRow, RecipeIngredientInput } from '@/types/database';

// Instruction row from database
import { RecipeInstructionRow, RecipeInstructionInput } from '@/types/database';

// User saved recipe (with personal notes, ratings, history)
import { UserSavedRecipe, UserSavedRecipeInput } from '@/types/database';

// Tags
import { RecipeTag, RecipeTagInput, COMMON_RECIPE_TAGS } from '@/types/database';
```

---

## Service Layer

All database operations are in `src/services/recipeService.ts`:

### Recipe CRUD Operations

```typescript
import {
  fetchUserRecipes,       // Get all recipes for a user
  fetchRecipeById,        // Get recipe with ingredients/instructions
  fetchPublicRecipes,     // Get all public recipes
  searchRecipes,          // Search by title/description
  filterRecipes,          // Filter by cuisine, difficulty, time
  createRecipe,           // Create new recipe
  updateRecipe,           // Update recipe metadata
  deleteRecipe,           // Delete recipe (cascades to children)
} from '@/services/recipeService';
```

### Ingredients Management

```typescript
import {
  createRecipeIngredient,           // Add single ingredient
  createRecipeIngredientsBulk,      // Add multiple ingredients
  updateRecipeIngredient,           // Update ingredient
  deleteRecipeIngredient,           // Remove ingredient
} from '@/services/recipeService';
```

### Instructions Management

```typescript
import {
  createRecipeInstruction,          // Add single instruction
  createRecipeInstructionsBulk,     // Add multiple instructions
  updateRecipeInstruction,          // Update instruction
  deleteRecipeInstruction,          // Remove instruction
} from '@/services/recipeService';
```

### User Saved Recipes

```typescript
import {
  saveRecipe,                       // Save recipe to user's collection
  fetchSavedRecipes,                // Get user's saved recipes
  updateSavedRecipe,                // Update rating/notes/cook count
  removeSavedRecipe,                // Unsave recipe
  markRecipeCooked,                 // Increment cook count
} from '@/services/recipeService';
```

### Tags Operations

```typescript
import {
  addRecipeTag,                     // Add single tag
  addRecipeTagsBulk,                // Add multiple tags
  getRecipeTags,                    // Get all tags for recipe
  removeRecipeTag,                  // Remove tag
  findRecipesByTag,                 // Find recipes by tag
} from '@/services/recipeService';
```

---

## Integration Examples

### 1. Creating a Complete Recipe

```typescript
import {
  createRecipe,
  createRecipeIngredientsBulk,
  createRecipeInstructionsBulk,
  addRecipeTagsBulk,
} from '@/services/recipeService';

async function createCompleteRecipe(
  userId: string,
  recipeData: {
    title: string;
    description: string;
    cuisine: string;
    difficulty: 'easy' | 'medium' | 'hard';
    prep_time_minutes: number;
    cook_time_minutes: number;
    servings: number;
    image_url: string;
    ingredients: Array<{
      name: string;
      quantity: number;
      unit: string;
      notes?: string;
    }>;
    instructions: Array<{
      step: number;
      description: string;
      duration_minutes?: number;
    }>;
    tags: string[];
  }
) {
  // 1. Create the recipe
  const recipeResult = await createRecipe({
    user_id: userId,
    title: recipeData.title,
    description: recipeData.description,
    cuisine: recipeData.cuisine,
    difficulty: recipeData.difficulty,
    prep_time_minutes: recipeData.prep_time_minutes,
    cook_time_minutes: recipeData.cook_time_minutes,
    servings: recipeData.servings,
    image_url: recipeData.image_url,
    source: 'user',
    is_public: false,
    source_id: null,
  });

  if (recipeResult.error) {
    throw new Error(recipeResult.error);
  }

  const recipeId = recipeResult.data!.id;

  // 2. Add ingredients
  const ingredientsWithIndex = recipeData.ingredients.map((ing, idx) => ({
    name: ing.name,
    quantity: ing.quantity,
    unit: ing.unit,
    is_optional: false,
    notes: ing.notes || null,
    order_index: idx + 1,
    inventory_match_id: null,
  }));

  const ingredientsResult = await createRecipeIngredientsBulk(
    recipeId,
    ingredientsWithIndex
  );

  if (ingredientsResult.error) {
    throw new Error(ingredientsResult.error);
  }

  // 3. Add instructions
  const instructionsWithRecipeId = recipeData.instructions.map((inst) => ({
    step_number: inst.step,
    instruction: inst.description,
    duration_minutes: inst.duration_minutes || null,
  }));

  const instructionsResult = await createRecipeInstructionsBulk(
    recipeId,
    instructionsWithRecipeId
  );

  if (instructionsResult.error) {
    throw new Error(instructionsResult.error);
  }

  // 4. Add tags
  if (recipeData.tags.length > 0) {
    const tagsResult = await addRecipeTagsBulk(recipeId, recipeData.tags);

    if (tagsResult.error) {
      console.warn('Failed to add tags:', tagsResult.error);
    }
  }

  return recipeId;
}
```

### 2. Displaying a Recipe with Details

```typescript
import { fetchRecipeById } from '@/services/recipeService';
import { formatCookingTime } from '@/types/database';

async function displayRecipe(recipeId: string) {
  const result = await fetchRecipeById(recipeId);

  if (result.error) {
    console.error('Failed to load recipe:', result.error);
    return;
  }

  const recipe = result.data!;

  console.log('Recipe:', recipe.title);
  console.log('Prep:', formatCookingTime(recipe.prep_time_minutes || 0));
  console.log('Cook:', formatCookingTime(recipe.cook_time_minutes || 0));
  console.log('Total:', formatCookingTime(recipe.total_time_minutes || 0));

  console.log('\nIngredients:');
  recipe.ingredients.forEach((ing) => {
    const optional = ing.optional ? ' (optional)' : '';
    console.log(
      `  - ${ing.quantity} ${ing.unit} ${ing.name}${optional}`
    );
  });

  console.log('\nInstructions:');
  recipe.instructions.forEach((inst) => {
    console.log(`  ${inst.step}. ${inst.description}`);
    if (inst.duration_minutes) {
      console.log(`     (${inst.duration_minutes} mins)`);
    }
  });

  if (recipe.tags.length > 0) {
    console.log('\nTags:', recipe.tags.join(', '));
  }
}
```

### 3. Saving & Rating a Recipe

```typescript
import {
  saveRecipe,
  updateSavedRecipe,
  markRecipeCooked,
} from '@/services/recipeService';

async function handleSaveRecipe(userId: string, recipeId: string) {
  const result = await saveRecipe({
    user_id: userId,
    recipe_id: recipeId,
    personal_notes: null,
    rating: null,
    times_cooked: 0,
    last_cooked_at: null,
    saved_at: new Date().toISOString(),
  });

  if (result.error) {
    console.error('Failed to save recipe:', result.error);
    return;
  }

  console.log('Recipe saved successfully!');
}

async function rateRecipe(userId: string, recipeId: string, rating: number) {
  const result = await updateSavedRecipe(userId, recipeId, {
    rating,
  });

  if (result.error) {
    console.error('Failed to rate recipe:', result.error);
    return;
  }

  console.log(`Recipe rated: ${rating}/5`);
}

async function recordCooking(userId: string, recipeId: string) {
  const result = await markRecipeCooked(userId, recipeId);

  if (result.error) {
    console.error('Failed to record cooking:', result.error);
    return;
  }

  console.log('Cooking recorded!');
}
```

### 4. Inventory Integration

```typescript
import { updateRecipeIngredient } from '@/services/recipeService';

/**
 * Link a recipe ingredient to an inventory item
 * This enables availability checking
 */
async function linkIngredientToInventory(
  ingredientId: string,
  inventoryItemId: string
) {
  const result = await updateRecipeIngredient(ingredientId, {
    inventory_match_id: inventoryItemId,
  });

  if (result.error) {
    console.error('Failed to link ingredient:', result.error);
    return;
  }

  console.log('Ingredient linked to inventory item');
}

/**
 * Check what ingredients user has available
 */
async function checkAvailableIngredients(
  recipe: RecipeWithDetails,
  userInventory: InventoryItem[]
) {
  const inventoryNames = new Set(
    userInventory.map((item) => item.name.toLowerCase())
  );

  const available = recipe.ingredients.filter((ing) =>
    inventoryNames.has(ing.name.toLowerCase())
  );

  const missing = recipe.ingredients.filter(
    (ing) => !inventoryNames.has(ing.name.toLowerCase())
  );

  return { available, missing };
}
```

### 5. Recipe Discovery & Filtering

```typescript
import {
  searchRecipes,
  filterRecipes,
  findRecipesByTag,
} from '@/services/recipeService';

// Search recipes by title/description
const searchResult = await searchRecipes('pasta', userId);

// Filter by difficulty and prep time
const easyQuickResult = await filterRecipes(
  {
    difficulty: 'easy',
    maxPrepTime: 30,
  },
  userId
);

// Find recipes by tag
const vegetarianResult = await findRecipesByTag('vegetarian');
```

---

## Row Level Security (RLS) Policies

### What Users Can Do

**View:**
- Their own recipes (public or private)
- All public recipes from other users

**Create:**
- Recipes (only own)
- Ingredients/instructions (only for own recipes)
- Tags (only for own recipes)

**Update:**
- Only own recipes and related items
- Can save other users' public recipes to personal collection

**Delete:**
- Only own recipes and related items
- Can unsave public recipes

### Policy Structure

```sql
-- Users can view own and public recipes
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

-- Similar policies for ingredients, instructions, tags
-- Nested checks ensure users can only modify their own recipes
```

---

## React Component Integration Pattern

### Example: Recipe Card Component

```typescript
import { Recipe } from '@/types/database';
import { formatCookingTime } from '@/types/database';

interface RecipeCardProps {
  recipe: Recipe;
  onSave?: (recipeId: string) => void;
  onRate?: (recipeId: string, rating: number) => void;
}

export function RecipeCard({ recipe, onSave, onRate }: RecipeCardProps) {
  return (
    <div className="recipe-card">
      {recipe.image_url && (
        <img src={recipe.image_url} alt={recipe.title} />
      )}

      <h3>{recipe.title}</h3>

      <div className="recipe-meta">
        <span>{recipe.difficulty}</span>
        <span>{formatCookingTime(recipe.total_time_minutes || 0)}</span>
        <span>{recipe.servings} servings</span>
      </div>

      {recipe.description && <p>{recipe.description}</p>}

      <div className="actions">
        {onSave && (
          <button onClick={() => onSave(recipe.id)}>
            Save Recipe
          </button>
        )}
        {onRate && (
          <button onClick={() => onRate(recipe.id, 5)}>
            Rate
          </button>
        )}
      </div>
    </div>
  );
}
```

---

## Performance Considerations

### Indexing Strategy

The migration includes 17 strategic indexes:

```sql
-- Fast user queries
CREATE INDEX idx_recipes_user_id ON public.recipes(user_id);

-- Public recipe discovery
CREATE INDEX idx_recipes_is_public ON public.recipes(is_public);

-- Filtering by cuisine/difficulty
CREATE INDEX idx_recipes_cuisine ON public.recipes(cuisine);
CREATE INDEX idx_recipes_difficulty ON public.recipes(difficulty);

-- Tag-based discovery
CREATE INDEX idx_recipe_tags_tag ON public.recipe_tags(tag);

-- User saved recipes with stats
CREATE INDEX idx_user_saved_recipes_rating ON public.user_saved_recipes(user_id, rating);
CREATE INDEX idx_user_saved_recipes_cooked ON public.user_saved_recipes(user_id, times_cooked);
```

### Query Optimization Tips

1. **Always fetch ingredients with display order:**
   ```typescript
   // Good: sorted by order_index
   .order('order_index', { ascending: true })

   // Bad: unsorted ingredients
   ```

2. **Use pagination for large result sets:**
   ```typescript
   .range(0, 49) // First 50 recipes
   ```

3. **Limit columns when possible:**
   ```typescript
   .select('id, title, image_url') // Not '*'
   ```

4. **Batch operations with bulk functions:**
   ```typescript
   // Good: Single insert with multiple rows
   createRecipeIngredientsBulk(recipeId, ingredients)

   // Bad: Loop with individual inserts
   for (const ing of ingredients) {
     await createRecipeIngredient(ing);
   }
   ```

---

## Common Workflows

### Workflow 1: User Creates Recipe from Scratch

1. User fills form with recipe details
2. Create recipe: `createRecipe()`
3. Create ingredients: `createRecipeIngredientsBulk()`
4. Create instructions: `createRecipeInstructionsBulk()`
5. Add tags: `addRecipeTagsBulk()`
6. Return recipe ID

### Workflow 2: AI Generates Recipe

1. Call Gemini API with user preferences
2. Parse response into recipe structure
3. Create recipe with `source: 'ai'`
4. Store in database
5. Return to user for review/editing

### Workflow 3: User Saves & Cooks

1. User discovers recipe (own, public, or API)
2. Click "Save": `saveRecipe()`
3. Add notes/rating: `updateSavedRecipe()`
4. Cook it: `markRecipeCooked()`
5. Track cooking history in `last_cooked_at` and `times_cooked`

### Workflow 4: Generate Shopping List from Recipe

1. Fetch recipe: `fetchRecipeById()`
2. Check inventory against ingredients
3. For missing items, create shopping list items
4. Link to recipe via `added_from_recipe_id`

---

## Testing Checklist

- [ ] Create recipe with ingredients and instructions
- [ ] Update recipe metadata (title, difficulty, times)
- [ ] Update ingredient (quantity, notes)
- [ ] Update instruction (step number, description)
- [ ] Save recipe to user's collection
- [ ] Update saved recipe (rating, notes, cook count)
- [ ] Remove saved recipe
- [ ] Add/remove tags
- [ ] Search recipes by title
- [ ] Filter recipes by difficulty
- [ ] Find recipes by tag
- [ ] Mark recipe as cooked
- [ ] Check RLS: User A cannot edit User B's recipes
- [ ] Check RLS: User can view public recipes from others
- [ ] Verify cascade delete (deleting recipe removes children)

---

## Security Notes

1. **RLS is Enabled**: All tables have Row Level Security policies
2. **User Isolation**: Users can only see/modify their own recipes
3. **Public Recipes**: Use `is_public = true` for discoverable recipes
4. **Source Tracking**: `source` field identifies recipe origin (user, ai, spoonacular)
5. **Input Validation**: Validate all inputs on client before sending to DB

---

## Future Enhancements

1. **AI Recipe Suggestions**: Link to Gemini integration
2. **Recipe Nutrition**: Add nutritional_info JSONB column
3. **Dietary Filtering**: Auto-filter recipes based on user preferences
4. **Shopping List Integration**: Auto-generate lists from saved recipes
5. **Recipe Variants**: Support recipe versions/modifications
6. **Community Ratings**: Aggregate user ratings across app
7. **Allergen Detection**: AI scan for user allergens in ingredients
8. **Cooking Timeline**: Calculate total time with parallel steps

---

## Files Reference

### Database
- **Migration**: `supabase/migrations/003_recipe_management.sql`

### TypeScript
- **Types**: `src/types/database.ts` (Recipe, RecipeIngredientRow, RecipeInstructionRow, UserSavedRecipe, RecipeTag)
- **Service**: `src/services/recipeService.ts`

### Helper Utilities
- `calculateTotalTime()` - Sum prep + cook time
- `formatCookingTime()` - Format minutes to human-readable time
- `COMMON_RECIPE_TAGS` - Pre-defined tag list

---

## Support & Questions

For questions about the recipe management system:
1. Check migration comments for schema details
2. Review type definitions for data structures
3. Look at service function signatures for API usage
4. Reference integration examples above
5. Check RLS policies for permission issues
