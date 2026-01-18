/**
 * Recipes Page Component for Aible
 *
 * Complete recipe management with saved recipes, AI-generated recipes, and favorites.
 * Features search, filtering, and AI recipe generation from inventory.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import {
  Sparkles,
  BookOpen,
  Heart,
  User,
  LogOut,
  Menu,
  ArrowLeft,
  ChefHat,
  Filter,
  Plus,
  Loader2,
} from 'lucide-react';
import { Footer } from '../components/shared';
import {
  RecipeCard,
  RecipeDetailModal,
  AddRecipeModal,
  RecipeFilters,
  AIRecipeGenerator,
  RecipeSearchBar,
  EmptyRecipes,
  EmptySearch,
} from '../components/recipes';
import { useRecipeStore } from '../stores/recipeStore';
import type { Recipe, RecipeWithDetails } from '../types/database';

export default function Recipes() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // UI State
  const [activeTab, setActiveTab] = useState<'saved' | 'ai' | 'favorites'>('saved');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeWithDetails | null>(null);
  const [aiGenerating, setAIGenerating] = useState(false);

  // Recipe Store
  const {
    filters,
    loading,
    setSearchQuery,
    setSelectedCuisine,
    setSelectedDifficulty,
    setSelectedTimeRange,
    setDietaryTags,
    clearFilters,
    getSavedRecipesWithDetails,
    getFavoriteRecipes,
    toggleFavorite,
    saveRecipe,
    unsaveRecipe,
    getStats,
    aiGeneratedRecipes,
  } = useRecipeStore();

  const savedRecipes = getSavedRecipesWithDetails();
  const favoriteRecipes = getFavoriteRecipes();
  const stats = getStats();

  /**
   * Handle sign out
   */
  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      console.error('Failed to sign out:', error.message);
      alert('Failed to sign out. Please try again.');
    }
  };

  /**
   * Get user's first name
   */
  const getFirstName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'there';
  };

  /**
   * Get user's profile picture
   */
  const getProfilePicture = () => {
    return user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  };

  /**
   * Handle recipe card click
   */
  const handleRecipeClick = (recipe: RecipeWithDetails) => {
    setSelectedRecipe(recipe);
    setShowDetailModal(true);
  };

  /**
   * Handle AI recipe generation
   */
  const handleAIGenerate = async (params: {
    ingredients: string[];
    cuisine?: string;
    difficulty?: string;
  }) => {
    setAIGenerating(true);
    try {
      // TODO: Implement actual AI generation with Gemini API
      console.log('Generating recipe with:', params);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert('AI Recipe Generation coming soon! This will use Google Gemini API to generate personalized recipes.');
      setShowAIGenerator(false);
    } catch (error) {
      console.error('Failed to generate recipe:', error);
      alert('Failed to generate recipe. Please try again.');
    } finally {
      setAIGenerating(false);
    }
  };

  /**
   * Handle add missing ingredients to cart
   */
  const handleAddMissingToCart = (ingredients: string[]) => {
    console.log('Add to cart:', ingredients);
    alert(`Added ${ingredients.length} ingredients to shopping list! (Feature coming soon)`);
  };

  /**
   * Handle save recipe
   */
  const handleSaveRecipe = (recipeId: string) => {
    if (user?.id) {
      saveRecipe(recipeId, user.id);
    }
  };

  /**
   * Handle unsave recipe
   */
  const handleUnsaveRecipe = (recipeId: string) => {
    if (user?.id) {
      unsaveRecipe(recipeId, user.id);
    }
  };

  /**
   * Get recipes for current tab
   * Converts Recipe to RecipeWithDetails by adding default empty arrays
   */
  const getCurrentTabRecipes = (): (RecipeWithDetails & { userRecipe?: any })[] => {
    const toRecipeWithDetails = (recipe: Recipe): RecipeWithDetails => ({
      ...recipe,
      ingredients: [],
      instructions: [],
      tags: [],
    });

    switch (activeTab) {
      case 'saved':
        return savedRecipes.map((sr) => ({
          ...toRecipeWithDetails(sr),
          userRecipe: sr.userRecipe,
        }));
      case 'ai':
        return aiGeneratedRecipes.map((recipe) => ({
          ...toRecipeWithDetails(recipe),
          userRecipe: savedRecipes.find((sr) => sr.id === recipe.id)?.userRecipe,
        }));
      case 'favorites':
        return favoriteRecipes.map((fr) => ({
          ...toRecipeWithDetails(fr),
          userRecipe: fr.userRecipe,
        }));
      default:
        return [];
    }
  };

  const currentRecipes = getCurrentTabRecipes();
  const hasActiveFilters =
    filters.searchQuery ||
    filters.selectedCuisine ||
    filters.selectedDifficulty ||
    filters.selectedTimeRange ||
    filters.dietaryTags.length > 0;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 relative overflow-x-hidden flex flex-col">
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="dot-pattern"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1" fill="currentColor" className="text-emerald-400" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-pattern)" />
        </svg>
      </div>

      {/* Header - Floating Island Style */}
      <div className="fixed top-4 left-4 right-4 z-50">
        <header className="max-w-[1600px] mx-auto bg-white/70 backdrop-blur-md border border-emerald-200/50 rounded-2xl shadow-sm transition-all duration-300">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="p-2 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer text-emerald-700"
                  aria-label="Go back to dashboard"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-3 cursor-pointer group"
                  style={{ border: 'none', outline: 'none', background: 'none', padding: 0 }}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                    <ChefHat className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <h1 className="text-5xl lg:text-6xl font-black tracking-tight hidden sm:block animate-shine">Aible</h1>
                </button>
              </div>

              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-3 hover:bg-emerald-50 rounded-xl px-3 py-1.5 transition-colors cursor-pointer border border-transparent hover:border-emerald-100"
                >
                  {getProfilePicture() ? (
                    <img
                      src={getProfilePicture()}
                      alt="Profile"
                      className="w-9 h-9 rounded-full border border-emerald-200"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-emerald-600" />
                    </div>
                  )}
                  <div className="text-sm text-left">
                    <p className="font-semibold text-emerald-900 leading-tight">{getFirstName()}</p>
                    <p className="text-emerald-600 text-xs leading-tight">{user?.email}</p>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-xl hover:bg-emerald-100 transition-colors text-emerald-600"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>

          {showMobileMenu && (
            <div className="md:hidden py-4 px-4 border-t border-emerald-100 bg-white/90 rounded-b-2xl">
              <div className="flex items-center gap-3 mb-4">
                {getProfilePicture() ? (
                  <img
                    src={getProfilePicture()}
                    alt="Profile"
                    className="w-12 h-12 rounded-full border-2 border-emerald-200"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-emerald-600" />
                  </div>
                )}
                <div className="text-sm">
                  <p className="font-bold text-emerald-900">{getFirstName()}</p>
                  <p className="text-emerald-700">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </header>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 relative z-10">
        {/* Header Section */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
            <div className="animate-slide-in-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-emerald-900 mb-2">
                My Recipes
              </h2>
              <p className="text-emerald-700 font-medium opacity-80">
                Discover, save, and generate personalized recipes with AI
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="group relative inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-emerald-300 hover:border-emerald-400 text-emerald-700 font-bold rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-100"
              >
                <Plus className="w-5 h-5" />
                <span>Add Recipe</span>
              </button>
              <button
                onClick={() => setShowAIGenerator(!showAIGenerator)}
                className="group relative inline-flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-200 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                <span>Generate with AI</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-100 p-1.5 flex overflow-x-auto max-w-full gap-1.5 animate-fade-in-up animation-delay-300 scrollbar-hide">
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-4 sm:px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
                activeTab === 'saved'
                  ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100'
                  : 'text-emerald-600/70 hover:text-emerald-700 hover:bg-emerald-50/50'
              }`}
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Saved ({stats.saved})
              </span>
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`px-4 sm:px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
                activeTab === 'ai'
                  ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100'
                  : 'text-emerald-600/70 hover:text-emerald-700 hover:bg-emerald-50/50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Generated ({stats.aiGenerated})
              </span>
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-4 sm:px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
                activeTab === 'favorites'
                  ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100'
                  : 'text-emerald-600/70 hover:text-emerald-700 hover:bg-emerald-50/50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Favorites ({stats.favorites})
              </span>
            </button>
          </div>
        </div>

        {/* AI Generator Section */}
        {showAIGenerator && (
          <div className="mb-8 animate-fade-in">
            <AIRecipeGenerator
              onGenerate={handleAIGenerate}
              loading={aiGenerating}
            />
          </div>
        )}

        {/* Search and Filters */}
        {!showAIGenerator && (
          <div className="mb-8 animate-fade-in animation-delay-400">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              {/* Search Bar */}
              <div className="flex-1">
                <RecipeSearchBar
                  value={filters.searchQuery}
                  onChange={setSearchQuery}
                />
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center gap-2 px-6 py-3.5 border font-bold rounded-2xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-100 whitespace-nowrap ${
                  showFilters || hasActiveFilters
                    ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                    : 'bg-white text-emerald-700 border-emerald-200/50 hover:bg-emerald-50 hover:border-emerald-300'
                }`}
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="ml-1 px-2 py-0.5 bg-white/20 text-white text-xs font-bold rounded-full">
                    Active
                  </span>
                )}
              </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <RecipeFilters
                selectedCuisine={filters.selectedCuisine}
                selectedDifficulty={filters.selectedDifficulty}
                selectedTimeRange={filters.selectedTimeRange}
                dietaryTags={filters.dietaryTags}
                onCuisineChange={setSelectedCuisine}
                onDifficultyChange={setSelectedDifficulty}
                onTimeRangeChange={setSelectedTimeRange}
                onDietaryTagsChange={setDietaryTags}
                onClearFilters={clearFilters}
              />
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
            <p className="text-emerald-700 font-semibold">Loading recipes...</p>
          </div>
        )}

        {/* Empty State - No Recipes in Tab */}
        {!loading && !showAIGenerator && currentRecipes.length === 0 && !hasActiveFilters && (
          <EmptyRecipes
            type={activeTab}
            onGenerateClick={() => setShowAIGenerator(true)}
          />
        )}

        {/* Empty State - No Search Results */}
        {!loading && !showAIGenerator && currentRecipes.length === 0 && hasActiveFilters && (
          <EmptySearch
            searchQuery={filters.searchQuery}
            onClearFilters={clearFilters}
          />
        )}

        {/* Recipe Grid */}
        {!loading && !showAIGenerator && currentRecipes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
            {currentRecipes.map((item) => (
              <RecipeCard
                key={item.id}
                recipe={item}
                userRecipe={'userRecipe' in item ? item.userRecipe : undefined}
                onClick={() => handleRecipeClick(item)}
                onToggleFavorite={toggleFavorite}
                showSource={activeTab === 'ai'}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <Footer />
      </main>

      {/* Modals */}
      {selectedRecipe && (
        <RecipeDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedRecipe(null);
          }}
          recipe={selectedRecipe}
          userRecipe={savedRecipes.find((sr) => sr.id === selectedRecipe.id)?.userRecipe}
          onToggleFavorite={toggleFavorite}
          onSaveRecipe={handleSaveRecipe}
          onUnsaveRecipe={handleUnsaveRecipe}
          onAddMissingToCart={handleAddMissingToCart}
        />
      )}

      <AddRecipeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}
