/**
 * Recipe Service
 *
 * Handles all Supabase operations for recipe management.
 * Provides CRUD operations with proper error handling and type safety.
 * Supports multiple recipe sources (user, AI, API) with full inventory integration.
 */

import { supabase } from '../lib/supabase';
import type {
  Recipe,
  RecipeInput,
  RecipeUpdate,
  RecipeIngredientRow,
  RecipeIngredientInput,
  RecipeInstructionRow,
  RecipeInstructionInput,
  UserSavedRecipe,
  UserSavedRecipeInput,
  UserSavedRecipeUpdate,
  RecipeTag,
  RecipeTagInput,
  RecipeWithDetails,
  UUID,
} from '../types/database';

// ============================================================================
// ERROR HANDLING
// ============================================================================

interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
}

/**
 * Handle Supabase errors with user-friendly messages
 */
function handleError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

// ============================================================================
// RECIPE CRUD OPERATIONS
// ============================================================================

/**
 * Fetch all recipes for a user (including public recipes)
 */
export async function fetchUserRecipes(
  userId: UUID
): Promise<ServiceResponse<Recipe[]>> {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user recipes:', error);
      return { data: null, error: handleError(error) };
    }

    return { data: data as Recipe[], error: null };
  } catch (error) {
    console.error('Unexpected error fetching user recipes:', error);
    return { data: null, error: handleError(error) };
  }
}

/**
 * Fetch a single recipe by ID with ingredients and instructions
 */
export async function fetchRecipeById(
  recipeId: UUID
): Promise<ServiceResponse<RecipeWithDetails>> {
  try {
    // Fetch base recipe
    const { data: recipeData, error: recipeError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', recipeId)
      .single();

    if (recipeError) {
      console.error('Error fetching recipe:', recipeError);
      return { data: null, error: handleError(recipeError) };
    }

    // Fetch ingredients
    const { data: ingredients, error: ingredError } = await supabase
      .from('recipe_ingredients')
      .select('*')
      .eq('recipe_id', recipeId)
      .order('order_index', { ascending: true });

    if (ingredError) {
      console.error('Error fetching ingredients:', ingredError);
      return { data: null, error: handleError(ingredError) };
    }

    // Fetch instructions
    const { data: instructions, error: instrError } = await supabase
      .from('recipe_instructions')
      .select('*')
      .eq('recipe_id', recipeId)
      .order('step_number', { ascending: true });

    if (instrError) {
      console.error('Error fetching instructions:', instrError);
      return { data: null, error: handleError(instrError) };
    }

    // Fetch tags
    const { data: tagsData, error: tagsError } = await supabase
      .from('recipe_tags')
      .select('tag')
      .eq('recipe_id', recipeId);

    if (tagsError) {
      console.error('Error fetching tags:', tagsError);
      return { data: null, error: handleError(tagsError) };
    }

    const recipe: RecipeWithDetails = {
      ...(recipeData as Recipe),
      ingredients: (ingredients as RecipeIngredientRow[]).map((ing) => ({
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        notes: ing.notes || undefined,
        optional: ing.is_optional,
      })),
      instructions: (instructions as RecipeInstructionRow[]).map((inst) => ({
        step: inst.step_number,
        description: inst.instruction,
        duration_minutes: inst.duration_minutes || undefined,
      })),
      tags: (tagsData as Array<{ tag: string }>).map((t) => t.tag),
    };

    return { data: recipe, error: null };
  } catch (error) {
    console.error('Unexpected error fetching recipe:', error);
    return { data: null, error: handleError(error) };
  }
}

/**
 * Fetch public recipes (discoverable by all users)
 */
export async function fetchPublicRecipes(): Promise<ServiceResponse<Recipe[]>> {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching public recipes:', error);
      return { data: null, error: handleError(error) };
    }

    return { data: data as Recipe[], error: null };
  } catch (error) {
    console.error('Unexpected error fetching public recipes:', error);
    return { data: null, error: handleError(error) };
  }
}

/**
 * Search recipes by title or description
 */
export async function searchRecipes(
  searchTerm: string,
  userId?: UUID
): Promise<ServiceResponse<Recipe[]>> {
  try {
    let query = supabase.from('recipes').select('*');

    // Search in title and description
    query = query.or(
      `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
    );

    // Filter by user or public recipes
    if (userId) {
      query = query.or(`user_id.eq.${userId},is_public.eq.true`);
    } else {
      query = query.eq('is_public', true);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) {
      console.error('Error searching recipes:', error);
      return { data: null, error: handleError(error) };
    }

    return { data: data as Recipe[], error: null };
  } catch (error) {
    console.error('Unexpected error searching recipes:', error);
    return { data: null, error: handleError(error) };
  }
}

/**
 * Filter recipes by cuisine and difficulty
 */
export async function filterRecipes(
  filters: {
    cuisine?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    maxPrepTime?: number;
  },
  userId?: UUID
): Promise<ServiceResponse<Recipe[]>> {
  try {
    let query = supabase.from('recipes').select('*');

    if (filters.cuisine) {
      query = query.ilike('cuisine', `%${filters.cuisine}%`);
    }

    if (filters.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }

    if (filters.maxPrepTime) {
      query = query.lte('prep_time_minutes', filters.maxPrepTime);
    }

    // Filter by user or public recipes
    if (userId) {
      query = query.or(`user_id.eq.${userId},is_public.eq.true`);
    } else {
      query = query.eq('is_public', true);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) {
      console.error('Error filtering recipes:', error);
      return { data: null, error: handleError(error) };
    }

    return { data: data as Recipe[], error: null };
  } catch (error) {
    console.error('Unexpected error filtering recipes:', error);
    return { data: null, error: handleError(error) };
  }
}

/**
 * Create a new recipe
 */
export async function createRecipe(
  recipe: RecipeInput
): Promise<ServiceResponse<Recipe>> {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .insert([recipe])
      .select()
      .single();

    if (error) {
      console.error('Error creating recipe:', error);
      return { data: null, error: handleError(error) };
    }

    return { data: data as Recipe, error: null };
  } catch (error) {
    console.error('Unexpected error creating recipe:', error);
    return { data: null, error: handleError(error) };
  }
}

/**
 * Update a recipe
 */
export async function updateRecipe(
  recipeId: UUID,
  updates: RecipeUpdate
): Promise<ServiceResponse<Recipe>> {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .update(updates)
      .eq('id', recipeId)
      .select()
      .single();

    if (error) {
      console.error('Error updating recipe:', error);
      return { data: null, error: handleError(error) };
    }

    return { data: data as Recipe, error: null };
  } catch (error) {
    console.error('Unexpected error updating recipe:', error);
    return { data: null, error: handleError(error) };
  }
}

/**
 * Delete a recipe (and cascade delete ingredients, instructions, tags)
 */
export async function deleteRecipe(recipeId: UUID): Promise<ServiceResponse<void>> {
  try {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', recipeId);

    if (error) {
      console.error('Error deleting recipe:', error);
      return { data: null, error: handleError(error) };
    }

    return { data: null, error: null };
  } catch (error) {
    console.error('Unexpected error deleting recipe:', error);
    return { data: null, error: handleError(error) };
  }
}

// ============================================================================
// RECIPE INGREDIENTS OPERATIONS
// ============================================================================

/**
 * Create a recipe ingredient
 */
export async function createRecipeIngredient(
  ingredient: RecipeIngredientInput
): Promise<ServiceResponse<RecipeIngredientRow>> {
  try {
    const { data, error } = await supabase
      .from('recipe_ingredients')
      .insert([ingredient])
      .select()
      .single();

    if (error) {
      console.error('Error creating recipe ingredient:', error);
      return { data: null, error: handleError(error) };
    }

    return { data: data as RecipeIngredientRow, error: null };
  } catch (error) {
    console.error('Unexpected error creating recipe ingredient:', error);
    return { data: null, error: handleError(error) };
  }
}

/**
 * Bulk create recipe ingredients
 */
export async function createRecipeIngredientsBulk(
  recipeId: UUID,
  ingredients: Omit<RecipeIngredientInput, 'recipe_id'>[]
): Promise<ServiceResponse<RecipeIngredientRow[]>> {
  try {
    const ingredientsWithRecipeId = ingredients.map((ing) => ({
      ...ing,
      recipe_id: recipeId,
    }));

    const { data, error } = await supabase
      .from('recipe_ingredients')
      .insert(ingredientsWithRecipeId)
      .select();

    if (error) {
      console.error('Error creating recipe ingredients:', error);
      return { data: null, error: handleError(error) };
    }

    return { data: data as RecipeIngredientRow[], error: null };
  } catch (error) {
    console.error('Unexpected error creating recipe ingredients:', error);
    return { data: null, error: handleError(error) };
  }
}

/**
 * Update a recipe ingredient
 */
export async function updateRecipeIngredient(
  ingredientId: UUID,
  updates: Partial<Omit<RecipeIngredientInput, 'recipe_id'>>
): Promise<ServiceResponse<RecipeIngredientRow>> {
  try {
    const { data, error } = await supabase
      .from('recipe_ingredients')
      .update(updates)
      .eq('id', ingredientId)
      .select()
      .single();

    if (error) {
      console.error('Error updating recipe ingredient:', error);
      return { data: null, error: handleError(error) };
    }

    return { data: data as RecipeIngredientRow, error: null };
  } catch (error) {
    console.error('Unexpected error updating recipe ingredient:', error);
    return { data: null, error: handleError(error) };
  }
}

/**
 * Delete a recipe ingredient
 */
export async function deleteRecipeIngredient(
  ingredientId: UUID
): Promise<ServiceResponse<void>> {
  try {
    const { error } = await supabase
      .from('recipe_ingredients')
      .delete()
      .eq('id', ingredientId);

    if (error) {
      console.error('Error deleting recipe ingredient:', error);
      return { data: null, error: handleError(error) };
    }

    return { data: null, error: null };
  } catch (error) {
    console.error('Unexpected error deleting recipe ingredient:', error);
    return { data: null, error: handleError(error) };
  }
}

// ============================================================================
// RECIPE INSTRUCTIONS OPERATIONS
// ============================================================================

/**
 * Create a recipe instruction
 */
export async function createRecipeInstruction(
  instruction: RecipeInstructionInput
): Promise<ServiceResponse<RecipeInstructionRow>> {
  try {
    const { data, error } = await supabase
      .from('recipe_instructions')
      .insert([instruction])
      .select()
      .single();

    if (error) {
      console.error('Error creating recipe instruction:', error);
      return { data: null, error: handleError(error) };
    }

    return { data: data as RecipeInstructionRow, error: null };
  } catch (error) {
    console.error('Unexpected error creating recipe instruction:', error);
    return { data: null, error: handleError(error) };
  }
}

/**
 * Bulk create recipe instructions
 */
export async function createRecipeInstructionsBulk(
  recipeId: UUID,
  instructions: Omit<RecipeInstructionInput, 'recipe_id'>[]
): Promise<ServiceResponse<RecipeInstructionRow[]>> {
  try {
    const instructionsWithRecipeId = instructions.map((inst) => ({
      ...inst,
      recipe_id: recipeId,
    }));

    const { data, error } = await supabase
      .from('recipe_instructions')
      .insert(instructionsWithRecipeId)
      .select();

    if (error) {
      console.error('Error creating recipe instructions:', error);
      return { data: null, error: handleError(error) };
    }

    return { data: data as RecipeInstructionRow[], error: null };
  } catch (error) {
    console.error('Unexpected error creating recipe instructions:', error);
    return { data: null, error: handleError(error) };
  }
}

/**
 * Update a recipe instruction
 */
export async function updateRecipeInstruction(
  instructionId: UUID,
  updates: Partial<Omit<RecipeInstructionInput, 'recipe_id'>>
): Promise<ServiceResponse<RecipeInstructionRow>> {
  try {
    const { data, error } = await supabase
      .from('recipe_instructions')
      .update(updates)
      .eq('id', instructionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating recipe instruction:', error);
      return { data: null, error: handleError(error) };
    }

    return { data: data as RecipeInstructionRow, error: null };
  } catch (error) {
    console.error('Unexpected error updating recipe instruction:', error);
    return { data: null, error: handleError(error) };
  }
}

/**
 * Delete a recipe instruction
 */
export async function deleteRecipeInstruction(
  instructionId: UUID
): Promise<ServiceResponse<void>> {
  try {
    const { error } = await supabase
      .from('recipe_instructions')
      .delete()
      .eq('id', instructionId);

    if (error) {
      console.error('Error deleting recipe instruction:', error);
      return { data: null, error: handleError(error) };
    }

    return { data: null, error: null };
  } catch (error) {
    console.error('Unexpected error deleting recipe instruction:', error);
    return { data: null, error: handleError(error) };
  }
}

// ============================================================================
// USER SAVED RECIPES OPERATIONS
// ============================================================================

/**
 * Save a recipe to user's collection
 */
export async function saveRecipe(
  saveData: UserSavedRecipeInput
): Promise<ServiceResponse<UserSavedRecipe>> {
  try {
    const { data, error } = await supabase
      .from('user_saved_recipes')
      .insert([saveData])
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // UNIQUE constraint violation
        return { data: null, error: 'Recipe already saved' };
      }
      console.error('Error saving recipe:', error);
      return { data: null, error: handleError(error) };
    }

    return { data: data as UserSavedRecipe, error: null };
  } catch (error) {
    console.error('Unexpected error saving recipe:', error);
    return { data: null, error: handleError(error) };
  }
}

/**
 * Fetch saved recipes for a user with recipe details
 */
export async function fetchSavedRecipes(userId: UUID): Promise<
  ServiceResponse<
    Array<{
      id: UUID;
      recipe: Recipe;
      personal_notes: string | null;
      rating: number | null;
      times_cooked: number;
      last_cooked_at: string | null;
    }>
  >
> {
  try {
    const { data, error } = await supabase
      .from('user_saved_recipes')
      .select('*, recipes(*)')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved recipes:', error);
      return { data: null, error: handleError(error) };
    }

    return { data: data as any[], error: null };
  } catch (error) {
    console.error('Unexpected error fetching saved recipes:', error);
    return { data: null, error: handleError(error) };
  }
}

/**
 * Update saved recipe metadata (notes, rating, cooked count)
 */
export async function updateSavedRecipe(
  userId: UUID,
  recipeId: UUID,
  updates: UserSavedRecipeUpdate
): Promise<ServiceResponse<UserSavedRecipe>> {
  try {
    const { data, error } = await supabase
      .from('user_saved_recipes')
      .update(updates)
      .eq('user_id', userId)
      .eq('recipe_id', recipeId)
      .select()
      .single();

    if (error) {
      console.error('Error updating saved recipe:', error);
      return { data: null, error: handleError(error) };
    }

    return { data: data as UserSavedRecipe, error: null };
  } catch (error) {
    console.error('Unexpected error updating saved recipe:', error);
    return { data: null, error: handleError(error) };
  }
}

/**
 * Remove a saved recipe
 */
export async function removeSavedRecipe(
  userId: UUID,
  recipeId: UUID
): Promise<ServiceResponse<void>> {
  try {
    const { error } = await supabase
      .from('user_saved_recipes')
      .delete()
      .eq('user_id', userId)
      .eq('recipe_id', recipeId);

    if (error) {
      console.error('Error removing saved recipe:', error);
      return { data: null, error: handleError(error) };
    }

    return { data: null, error: null };
  } catch (error) {
    console.error('Unexpected error removing saved recipe:', error);
    return { data: null, error: handleError(error) };
  }
}

/**
 * Mark recipe as cooked
 */
export async function markRecipeCooked(
  userId: UUID,
  recipeId: UUID
): Promise<ServiceResponse<UserSavedRecipe>> {
  try {
    // Get current cooked count
    const { data: current } = await supabase
      .from('user_saved_recipes')
      .select('times_cooked')
      .eq('user_id', userId)
      .eq('recipe_id', recipeId)
      .single();

    const newCount = (current?.times_cooked || 0) + 1;

    const { data, error } = await supabase
      .from('user_saved_recipes')
      .update({
        times_cooked: newCount,
        last_cooked_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('recipe_id', recipeId)
      .select()
      .single();

    if (error) {
      console.error('Error marking recipe cooked:', error);
      return { data: null, error: handleError(error) };
    }

    return { data: data as UserSavedRecipe, error: null };
  } catch (error) {
    console.error('Unexpected error marking recipe cooked:', error);
    return { data: null, error: handleError(error) };
  }
}

// ============================================================================
// RECIPE TAGS OPERATIONS
// ============================================================================

/**
 * Add a tag to a recipe
 */
export async function addRecipeTag(
  tag: RecipeTagInput
): Promise<ServiceResponse<RecipeTag>> {
  try {
    const { data, error } = await supabase
      .from('recipe_tags')
      .insert([tag])
      .select()
      .single();

    if (error) {
      // Ignore unique constraint violations
      if (error.code === 'PGRST116') {
        return { data: null, error: 'Tag already exists for this recipe' };
      }
      console.error('Error adding recipe tag:', error);
      return { data: null, error: handleError(error) };
    }

    return { data: data as RecipeTag, error: null };
  } catch (error) {
    console.error('Unexpected error adding recipe tag:', error);
    return { data: null, error: handleError(error) };
  }
}

/**
 * Bulk add tags to a recipe
 */
export async function addRecipeTagsBulk(
  recipeId: UUID,
  tags: string[]
): Promise<ServiceResponse<RecipeTag[]>> {
  try {
    const tagObjects = tags.map((tag) => ({ recipe_id: recipeId, tag }));

    const { data, error } = await supabase
      .from('recipe_tags')
      .insert(tagObjects)
      .select();

    if (error) {
      console.error('Error adding recipe tags:', error);
      return { data: null, error: handleError(error) };
    }

    return { data: data as RecipeTag[], error: null };
  } catch (error) {
    console.error('Unexpected error adding recipe tags:', error);
    return { data: null, error: handleError(error) };
  }
}

/**
 * Get all tags for a recipe
 */
export async function getRecipeTags(
  recipeId: UUID
): Promise<ServiceResponse<string[]>> {
  try {
    const { data, error } = await supabase
      .from('recipe_tags')
      .select('tag')
      .eq('recipe_id', recipeId);

    if (error) {
      console.error('Error fetching recipe tags:', error);
      return { data: null, error: handleError(error) };
    }

    return {
      data: (data as Array<{ tag: string }>).map((t) => t.tag),
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error fetching recipe tags:', error);
    return { data: null, error: handleError(error) };
  }
}

/**
 * Remove a tag from a recipe
 */
export async function removeRecipeTag(
  recipeId: UUID,
  tag: string
): Promise<ServiceResponse<void>> {
  try {
    const { error } = await supabase
      .from('recipe_tags')
      .delete()
      .eq('recipe_id', recipeId)
      .eq('tag', tag);

    if (error) {
      console.error('Error removing recipe tag:', error);
      return { data: null, error: handleError(error) };
    }

    return { data: null, error: null };
  } catch (error) {
    console.error('Unexpected error removing recipe tag:', error);
    return { data: null, error: handleError(error) };
  }
}

/**
 * Find recipes by tag
 */
export async function findRecipesByTag(tag: string): Promise<
  ServiceResponse<Recipe[]>
> {
  try {
    const { data, error } = await supabase
      .from('recipe_tags')
      .select('recipe_id')
      .eq('tag', tag);

    if (error) {
      console.error('Error finding recipes by tag:', error);
      return { data: null, error: handleError(error) };
    }

    const recipeIds = (data as Array<{ recipe_id: UUID }>).map(
      (t) => t.recipe_id
    );

    if (recipeIds.length === 0) {
      return { data: [], error: null };
    }

    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('*')
      .in('id', recipeIds)
      .order('created_at', { ascending: false });

    if (recipesError) {
      console.error('Error fetching recipes:', recipesError);
      return { data: null, error: handleError(recipesError) };
    }

    return { data: recipes as Recipe[], error: null };
  } catch (error) {
    console.error('Unexpected error finding recipes by tag:', error);
    return { data: null, error: handleError(error) };
  }
}

// ============================================================================
// STATISTICS & ANALYTICS
// ============================================================================

/**
 * Get recipe statistics for a user
 */
export async function getRecipeStats(userId: UUID): Promise<
  ServiceResponse<{
    total_recipes: number;
    saved_recipes: number;
    favorite_recipes: number;
    total_cooked: number;
    average_difficulty: string;
  }>
> {
  try {
    const { data: recipes, error: recipeError } = await supabase
      .from('recipes')
      .select('id, difficulty')
      .eq('user_id', userId);

    if (recipeError) {
      console.error('Error fetching recipes:', recipeError);
      return { data: null, error: handleError(recipeError) };
    }

    const { data: saved, error: savedError } = await supabase
      .from('user_saved_recipes')
      .select('times_cooked')
      .eq('user_id', userId);

    if (savedError) {
      console.error('Error fetching saved recipes:', savedError);
      return { data: null, error: handleError(savedError) };
    }

    const difficulties = (recipes as Array<{ difficulty: string }>).map(
      (r) => r.difficulty
    );
    const avgDifficulty = difficulties.length
      ? difficulties[Math.floor(difficulties.length / 2)]
      : 'N/A';

    const totalCooked = (saved as Array<{ times_cooked: number }>).reduce(
      (sum, r) => sum + r.times_cooked,
      0
    );

    return {
      data: {
        total_recipes: recipes?.length || 0,
        saved_recipes: saved?.length || 0,
        favorite_recipes: 0, // Would need to query separately
        total_cooked: totalCooked,
        average_difficulty: avgDifficulty,
      },
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error fetching recipe stats:', error);
    return { data: null, error: handleError(error) };
  }
}
