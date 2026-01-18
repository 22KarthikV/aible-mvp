# Recipe Management System - Quick Start Guide

## What Was Built

A complete Recipe Management system for Aible with:
- Database schema (5 tables, 17 indexes, RLS policies)
- TypeScript types (full type safety)
- Service layer (29 functions for all CRUD operations)
- Comprehensive documentation

**Time to implement UI: ~2-3 hours** (with the service layer complete)

---

## Files & Locations

```
Database Migration:
  C:\...\aible-frontend\supabase\migrations\003_recipe_management.sql

Type Definitions:
  C:\...\aible-frontend\src\types\database.ts (UPDATED)

Service Functions:
  C:\...\aible-frontend\src\services\recipeService.ts (NEW)

Documentation:
  C:\...\aible-frontend\RECIPE_MANAGEMENT_SETUP.md
  C:\...\aible-frontend\RECIPE_API_DESIGN_REPORT.md
  C:\...\aible-frontend\RECIPE_SYSTEM_QUICKSTART.md (this file)
```

---

## 30-Second Setup

### 1. Apply Database Migration
```bash
cd aible-frontend
supabase db push
# This runs: supabase/migrations/003_recipe_management.sql
```

### 2. Import Types
```typescript
import {
  Recipe,
  RecipeWithDetails,
  UserSavedRecipe,
  COMMON_RECIPE_TAGS,
} from '@/types/database';
```

### 3. Import Service Functions
```typescript
import {
  createRecipe,
  fetchRecipeById,
  saveRecipe,
  // ... all 29 functions available
} from '@/services/recipeService';
```

### 4. Start Building UI
```typescript
async function displayRecipe(recipeId) {
  const result = await fetchRecipeById(recipeId);
  if (result.error) {
    console.error(result.error);
    return;
  }
  // result.data contains full recipe with ingredients & instructions
}
```

---

## Key Functions Reference

### Create Recipe
```typescript
const result = await createRecipe({
  user_id: userId,
  title: 'Pasta Carbonara',
  cuisine: 'italian',
  difficulty: 'medium',
  prep_time_minutes: 15,
  cook_time_minutes: 20,
  servings: 4,
  is_public: false,
  source: 'user',
  // ... other fields
});
```

### Add Ingredients
```typescript
const result = await createRecipeIngredientsBulk(recipeId, [
  {
    name: 'Spaghetti',
    quantity: 400,
    unit: 'grams',
    order_index: 1,
    is_optional: false,
  },
  // ... more ingredients
]);
```

### Add Instructions
```typescript
const result = await createRecipeInstructionsBulk(recipeId, [
  {
    step_number: 1,
    instruction: 'Boil water in large pot',
    duration_minutes: 5,
  },
  // ... more steps
]);
```

### Save Recipe to Collection
```typescript
const result = await saveRecipe({
  user_id: userId,
  recipe_id: recipeId,
  personal_notes: null,
  rating: null,
  times_cooked: 0,
  saved_at: new Date().toISOString(),
});
```

### Get Recipe with Full Details
```typescript
const result = await fetchRecipeById(recipeId);

// Returns:
// {
//   ...recipe,
//   ingredients: [{ name, quantity, unit, notes, optional }, ...],
//   instructions: [{ step, description, duration_minutes }, ...],
//   tags: ['vegetarian', 'quick', ...]
// }
```

### Rate Recipe
```typescript
const result = await updateSavedRecipe(userId, recipeId, {
  rating: 5,
  personal_notes: 'Amazing pasta!',
});
```

### Find by Tag
```typescript
const result = await findRecipesByTag('vegetarian');
// Returns all recipes tagged as vegetarian
```

---

## Database Schema Overview

### recipes
- **Core recipe data** (title, description, timing, source, visibility)
- Fields: id, user_id, title, cuisine, difficulty, prep_time, cook_time, is_public, source
- Auto-calculated: total_time_minutes

### recipe_ingredients
- **Individual ingredients** with quantities and units
- Fields: id, recipe_id, name, quantity, unit, order_index, inventory_match_id
- Links to inventory_items for availability checking

### recipe_instructions
- **Ordered cooking steps** with optional time estimates
- Fields: id, recipe_id, step_number, instruction, duration_minutes

### user_saved_recipes
- **User's recipe collection** with personal metadata
- Fields: id, user_id, recipe_id, rating, personal_notes, times_cooked, last_cooked_at
- Unique constraint: (user_id, recipe_id)

### recipe_tags
- **Flexible recipe categorization**
- Fields: id, recipe_id, tag
- Unique constraint: (recipe_id, tag)

---

## Security Features

**RLS Policies (Row Level Security)**:
- Users can view own recipes + all public recipes
- Users can only edit/delete their own recipes
- Ingredients/instructions inherit parent recipe permissions
- No cross-tenant data exposure possible

**All operations automatically filtered by `auth.uid()`**

---

## Common Tasks

### Task: Create a Complete Recipe
```typescript
async function createCompleteRecipe(userId, recipeData) {
  // 1. Create recipe
  const { data: recipe } = await createRecipe({
    user_id: userId,
    title: recipeData.title,
    // ... other fields
    source: 'user',
  });

  // 2. Add ingredients
  await createRecipeIngredientsBulk(recipe.id, recipeData.ingredients);

  // 3. Add instructions
  await createRecipeInstructionsBulk(recipe.id, recipeData.instructions);

  // 4. Add tags
  if (recipeData.tags.length) {
    await addRecipeTagsBulk(recipe.id, recipeData.tags);
  }

  return recipe.id;
}
```

### Task: Display Recipe Card
```typescript
async function showRecipeCard(recipeId) {
  const { data: recipe } = await fetchRecipeById(recipeId);

  return (
    <div>
      <h3>{recipe.title}</h3>
      <p>{recipe.difficulty} - {formatCookingTime(recipe.total_time_minutes)}</p>
      <ul>
        {recipe.ingredients.map(ing => (
          <li key={ing.name}>
            {ing.quantity} {ing.unit} {ing.name}
          </li>
        ))}
      </ul>
      <ol>
        {recipe.instructions.map(inst => (
          <li key={inst.step}>{inst.description}</li>
        ))}
      </ol>
    </div>
  );
}
```

### Task: Check What Ingredients User Has
```typescript
async function checkAvailable(recipeId, userId) {
  const { data: recipe } = await fetchRecipeById(recipeId);
  const { data: inventory } = await fetchInventoryItems(userId);

  const inventoryNames = new Set(
    inventory.map(item => item.name.toLowerCase())
  );

  const available = recipe.ingredients.filter(ing =>
    inventoryNames.has(ing.name.toLowerCase())
  );

  const missing = recipe.ingredients.filter(ing =>
    !inventoryNames.has(ing.name.toLowerCase())
  );

  return { available, missing };
}
```

### Task: Track Cooking History
```typescript
async function recordCooking(userId, recipeId) {
  await markRecipeCooked(userId, recipeId);
  // Increments times_cooked and updates last_cooked_at
}
```

---

## Response Format (All Functions)

**Success**:
```typescript
{
  data: <actual_result>,
  error: null
}
```

**Error**:
```typescript
{
  data: null,
  error: "User-friendly error message"
}
```

**Always check error first**:
```typescript
const result = await someFunction();

if (result.error) {
  console.error('Failed:', result.error);
  return;
}

const data = result.data!; // Safe to use
```

---

## Helper Functions

```typescript
import {
  calculateTotalTime,        // prep + cook time
  formatCookingTime,         // 90 mins → "1 hr 30 min"
  formatRating,              // 4.5 → "4.5/5"
  COMMON_RECIPE_TAGS,        // ['vegetarian', 'quick', ...]
} from '@/types/database';
```

---

## Integration with Inventory

Link recipe ingredients to inventory items for "what do you have" checking:

```typescript
// When user adds ingredient to recipe
const ingredientId = 'ing-123';
const inventoryItemId = 'inv-456';

// Link them
await updateRecipeIngredient(ingredientId, {
  inventory_match_id: inventoryItemId,
});

// Now when checking availability:
// Recipe ingredient will show it's available via inventory
```

---

## What's NOT Included (Yet)

These can be built on top of the foundation:

- AI recipe generation (integrate with Gemini)
- Nutritional information (add to schema if needed)
- Meal planning (separate feature)
- Community sharing (moderate public recipes)
- Recipe reviews/comments (separate table)
- Allergen detection (AI analysis)

---

## Next Steps for Your Team

### Immediate (This Sprint)
1. Run migration: `supabase db push`
2. Create recipe form component
3. Create recipe display component
4. Implement save/rate functionality

### Short Term (Next Sprint)
1. Integrate with Gemini for AI recipe generation
2. Add recipe search UI
3. Create saved recipes list view
4. Implement recipe filtering

### Testing Checklist
- [ ] Create recipe with ingredients
- [ ] Fetch recipe with details
- [ ] Save recipe to collection
- [ ] Rate and add notes
- [ ] Search recipes
- [ ] Filter by difficulty
- [ ] Check RLS (user A can't see user B's private recipes)

---

## Code Example: Full Recipe Creation Flow

```typescript
import {
  createRecipe,
  createRecipeIngredientsBulk,
  createRecipeInstructionsBulk,
  addRecipeTagsBulk,
} from '@/services/recipeService';

async function handleCreateRecipe(formData) {
  try {
    // 1. Create recipe
    const recipeRes = await createRecipe({
      user_id: currentUser.id,
      title: formData.title,
      description: formData.description,
      cuisine: formData.cuisine,
      difficulty: formData.difficulty,
      prep_time_minutes: formData.prepTime,
      cook_time_minutes: formData.cookTime,
      servings: formData.servings,
      image_url: formData.imageUrl,
      source: 'user',
      source_id: null,
      is_public: formData.isPublic,
    });

    if (recipeRes.error) throw new Error(recipeRes.error);
    const recipeId = recipeRes.data!.id;

    // 2. Add ingredients
    const ingredientsRes = await createRecipeIngredientsBulk(
      recipeId,
      formData.ingredients.map((ing, idx) => ({
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        is_optional: ing.optional || false,
        notes: ing.notes || null,
        order_index: idx + 1,
        inventory_match_id: null,
      }))
    );

    if (ingredientsRes.error) throw new Error(ingredientsRes.error);

    // 3. Add instructions
    const instructionsRes = await createRecipeInstructionsBulk(
      recipeId,
      formData.instructions.map((inst) => ({
        step_number: inst.step,
        instruction: inst.text,
        duration_minutes: inst.duration || null,
      }))
    );

    if (instructionsRes.error) throw new Error(instructionsRes.error);

    // 4. Add tags
    if (formData.tags.length > 0) {
      const tagsRes = await addRecipeTagsBulk(recipeId, formData.tags);
      if (tagsRes.error) console.warn('Tag warning:', tagsRes.error);
    }

    // Success!
    showNotification('Recipe created successfully!');
    navigate(`/recipes/${recipeId}`);
  } catch (error) {
    showError(error.message);
  }
}
```

---

## Performance Tips

1. **Use bulk functions** when adding multiple items
   ```typescript
   // Good: single query
   await createRecipeIngredientsBulk(recipeId, ingredients);

   // Bad: loop with 20 queries
   for (const ing of ingredients) {
     await createRecipeIngredient(ing);
   }
   ```

2. **Cache user's saved recipes** on client
   ```typescript
   const [savedRecipes, setSavedRecipes] = useState([]);

   useEffect(() => {
     fetchSavedRecipes(userId).then(r => {
       if (!r.error) setSavedRecipes(r.data);
     });
   }, [userId]);
   ```

3. **Paginate large result sets**
   ```typescript
   const { data: recipes } = await supabase
     .from('recipes')
     .select('*')
     .range(0, 49); // First 50 recipes
   ```

---

## Support Resources

- **Setup Guide**: `RECIPE_MANAGEMENT_SETUP.md` - Comprehensive implementation guide
- **Design Report**: `RECIPE_API_DESIGN_REPORT.md` - Architecture decisions and security analysis
- **Migration**: `supabase/migrations/003_recipe_management.sql` - SQL with full comments
- **Types**: `src/types/database.ts` - Inline documentation for all types
- **Service**: `src/services/recipeService.ts` - Function signatures and comments

---

**Status**: READY FOR DEVELOPMENT

All infrastructure is in place. You can start building UI components immediately using the provided service functions.

Good luck! 🍳
