/**
 * Recipe Store
 *
 * Manages recipe state using Zustand for performance and real-time updates.
 * Handles recipe CRUD operations, filtering, and search functionality.
 */

import { create } from 'zustand';
import type {
  Recipe,
  UserRecipe,
  UUID,
  RecipeDifficulty,
  CuisineType,
} from '../types/database';

interface RecipeFilters {
  searchQuery: string;
  selectedCuisine: CuisineType | null;
  selectedDifficulty: RecipeDifficulty | null;
  selectedTimeRange: 'under-30' | '30-60' | 'over-60' | null;
  dietaryTags: string[];
}

interface RecipeState {
  // Data
  recipes: Recipe[];
  savedRecipes: UserRecipe[];
  aiGeneratedRecipes: Recipe[];
  loading: boolean;
  error: string | null;

  // Filters
  filters: RecipeFilters;

  // Actions - Data Management
  setRecipes: (recipes: Recipe[]) => void;
  setSavedRecipes: (savedRecipes: UserRecipe[]) => void;
  setAIGeneratedRecipes: (recipes: Recipe[]) => void;
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (id: UUID, updates: Partial<Recipe>) => void;
  deleteRecipe: (id: UUID) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Actions - User Recipe Management
  saveRecipe: (recipeId: UUID, userId: UUID) => void;
  unsaveRecipe: (recipeId: UUID, userId: UUID) => void;
  toggleFavorite: (recipeId: UUID) => void;
  updateUserRecipe: (recipeId: UUID, updates: Partial<UserRecipe>) => void;

  // Actions - Filters
  setSearchQuery: (query: string) => void;
  setSelectedCuisine: (cuisine: CuisineType | null) => void;
  setSelectedDifficulty: (difficulty: RecipeDifficulty | null) => void;
  setSelectedTimeRange: (range: 'under-30' | '30-60' | 'over-60' | null) => void;
  setDietaryTags: (tags: string[]) => void;
  clearFilters: () => void;
  setFilters: (filters: Partial<RecipeFilters>) => void;

  // Computed - Filtered Items
  getFilteredRecipes: () => Recipe[];
  getSavedRecipesWithDetails: () => Array<Recipe & { userRecipe: UserRecipe }>;
  getFavoriteRecipes: () => Array<Recipe & { userRecipe: UserRecipe }>;

  // Computed - Statistics
  getStats: () => {
    total: number;
    saved: number;
    favorites: number;
    aiGenerated: number;
  };
}

/**
 * Check if recipe matches time range filter
 */
function matchesTimeRange(
  recipe: Recipe,
  range: 'under-30' | '30-60' | 'over-60' | null
): boolean {
  if (!range) return true;

  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);

  switch (range) {
    case 'under-30':
      return totalTime < 30;
    case '30-60':
      return totalTime >= 30 && totalTime <= 60;
    case 'over-60':
      return totalTime > 60;
    default:
      return true;
  }
}

export const useRecipeStore = create<RecipeState>((set, get) => ({
  // Initial State
  recipes: [],
  savedRecipes: [],
  aiGeneratedRecipes: [],
  loading: false,
  error: null,
  filters: {
    searchQuery: '',
    selectedCuisine: null,
    selectedDifficulty: null,
    selectedTimeRange: null,
    dietaryTags: [],
  },

  // Data Management Actions
  setRecipes: (recipes) => set({ recipes, error: null }),

  setSavedRecipes: (savedRecipes) => set({ savedRecipes, error: null }),

  setAIGeneratedRecipes: (recipes) =>
    set({ aiGeneratedRecipes: recipes, error: null }),

  addRecipe: (recipe) =>
    set((state) => ({
      recipes: [...state.recipes, recipe],
      error: null,
    })),

  updateRecipe: (id, updates) =>
    set((state) => ({
      recipes: state.recipes.map((recipe) =>
        recipe.id === id ? { ...recipe, ...updates } : recipe
      ),
      aiGeneratedRecipes: state.aiGeneratedRecipes.map((recipe) =>
        recipe.id === id ? { ...recipe, ...updates } : recipe
      ),
      error: null,
    })),

  deleteRecipe: (id) =>
    set((state) => ({
      recipes: state.recipes.filter((recipe) => recipe.id !== id),
      aiGeneratedRecipes: state.aiGeneratedRecipes.filter(
        (recipe) => recipe.id !== id
      ),
      savedRecipes: state.savedRecipes.filter(
        (userRecipe) => userRecipe.recipe_id !== id
      ),
      error: null,
    })),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // User Recipe Management
  saveRecipe: (recipeId, userId) =>
    set((state) => {
      // Check if already saved
      if (state.savedRecipes.some((ur) => ur.recipe_id === recipeId)) {
        return state;
      }

      const newUserRecipe: UserRecipe = {
        id: crypto.randomUUID(),
        user_id: userId,
        recipe_id: recipeId,
        is_favorite: false,
        rating: null,
        notes: null,
        cooked_count: 0,
        last_cooked_at: null,
        created_at: new Date().toISOString(),
      };

      return {
        savedRecipes: [...state.savedRecipes, newUserRecipe],
        error: null,
      };
    }),

  unsaveRecipe: (recipeId, _userId) =>
    set((state) => ({
      savedRecipes: state.savedRecipes.filter(
        (userRecipe) => userRecipe.recipe_id !== recipeId
      ),
      error: null,
    })),

  toggleFavorite: (recipeId) =>
    set((state) => ({
      savedRecipes: state.savedRecipes.map((userRecipe) =>
        userRecipe.recipe_id === recipeId
          ? { ...userRecipe, is_favorite: !userRecipe.is_favorite }
          : userRecipe
      ),
      error: null,
    })),

  updateUserRecipe: (recipeId, updates) =>
    set((state) => ({
      savedRecipes: state.savedRecipes.map((userRecipe) =>
        userRecipe.recipe_id === recipeId
          ? { ...userRecipe, ...updates }
          : userRecipe
      ),
      error: null,
    })),

  // Filter Actions
  setSearchQuery: (searchQuery) =>
    set((state) => ({
      filters: { ...state.filters, searchQuery },
    })),

  setSelectedCuisine: (selectedCuisine) =>
    set((state) => ({
      filters: { ...state.filters, selectedCuisine },
    })),

  setSelectedDifficulty: (selectedDifficulty) =>
    set((state) => ({
      filters: { ...state.filters, selectedDifficulty },
    })),

  setSelectedTimeRange: (selectedTimeRange) =>
    set((state) => ({
      filters: { ...state.filters, selectedTimeRange },
    })),

  setDietaryTags: (dietaryTags) =>
    set((state) => ({
      filters: { ...state.filters, dietaryTags },
    })),

  clearFilters: () =>
    set((state) => ({
      filters: {
        ...state.filters,
        searchQuery: '',
        selectedCuisine: null,
        selectedDifficulty: null,
        selectedTimeRange: null,
        dietaryTags: [],
      },
    })),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  // Filtered Recipes (Computed)
  getFilteredRecipes: () => {
    const { recipes, filters } = get();

    let filtered = [...recipes];

    // Search filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(query) ||
          recipe.description?.toLowerCase().includes(query) ||
          recipe.cuisine?.toLowerCase().includes(query)
      );
    }

    // Cuisine filter
    if (filters.selectedCuisine) {
      filtered = filtered.filter(
        (recipe) => recipe.cuisine === filters.selectedCuisine
      );
    }

    // Difficulty filter
    if (filters.selectedDifficulty) {
      filtered = filtered.filter(
        (recipe) => recipe.difficulty === filters.selectedDifficulty
      );
    }

    // Time range filter
    if (filters.selectedTimeRange) {
      filtered = filtered.filter((recipe) =>
        matchesTimeRange(recipe, filters.selectedTimeRange)
      );
    }

    // Dietary tags filter (future implementation)
    // if (filters.dietaryTags.length > 0) {
    //   filtered = filtered.filter((recipe) =>
    //     filters.dietaryTags.some((tag) => recipe.tags?.includes(tag))
    //   );
    // }

    return filtered;
  },

  // Saved Recipes with Details (Computed)
  getSavedRecipesWithDetails: () => {
    const { recipes, savedRecipes, aiGeneratedRecipes } = get();

    const allRecipes = [...recipes, ...aiGeneratedRecipes];

    return savedRecipes
      .map((userRecipe) => {
        const recipe = allRecipes.find((r) => r.id === userRecipe.recipe_id);
        if (!recipe) return null;
        return { ...recipe, userRecipe };
      })
      .filter(Boolean) as Array<Recipe & { userRecipe: UserRecipe }>;
  },

  // Favorite Recipes (Computed)
  getFavoriteRecipes: () => {
    const { recipes, savedRecipes, aiGeneratedRecipes } = get();

    const allRecipes = [...recipes, ...aiGeneratedRecipes];
    const favoriteUserRecipes = savedRecipes.filter((ur) => ur.is_favorite);

    return favoriteUserRecipes
      .map((userRecipe) => {
        const recipe = allRecipes.find((r) => r.id === userRecipe.recipe_id);
        if (!recipe) return null;
        return { ...recipe, userRecipe };
      })
      .filter(Boolean) as Array<Recipe & { userRecipe: UserRecipe }>;
  },

  // Statistics (Computed)
  getStats: () => {
    const { recipes, savedRecipes, aiGeneratedRecipes } = get();

    const total = recipes.length + aiGeneratedRecipes.length;
    const saved = savedRecipes.length;
    const favorites = savedRecipes.filter((ur) => ur.is_favorite).length;
    const aiGenerated = aiGeneratedRecipes.length;

    return {
      total,
      saved,
      favorites,
      aiGenerated,
    };
  },
}));
