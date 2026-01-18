/**
 * Recipe Card Component
 *
 * Displays a recipe preview with glassmorphism design.
 * Shows recipe image, title, time, difficulty, and actions.
 */

import { useState } from 'react';
import {
  Clock,
  ChefHat,
  Heart,
  Star,
  Calendar,
  Users,
} from 'lucide-react';
import type { RecipeWithDetails, UserRecipe } from '../../types/database';
import { formatCookingTime } from '../../types/database';

interface RecipeCardProps {
  recipe: RecipeWithDetails;
  userRecipe?: UserRecipe;
  onClick: () => void;
  onToggleFavorite?: (recipeId: string) => void;
  showSource?: boolean;
}

export default function RecipeCard({
  recipe,
  userRecipe,
  onClick,
  onToggleFavorite,
  showSource = false,
}: RecipeCardProps) {
  const [imageError, setImageError] = useState(false);
  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);
  const isFavorited = userRecipe?.is_favorite || false;

  /**
   * Get difficulty badge color
   */
  const getDifficultyColor = () => {
    switch (recipe.difficulty) {
      case 'easy':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'hard':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  /**
   * Get cuisine badge color
   */
  const getCuisineBadgeColor = () => {
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-pink-100 text-pink-700',
      'bg-indigo-100 text-indigo-700',
      'bg-teal-100 text-teal-700',
    ];

    // Simple hash to consistently assign color based on cuisine
    const index = recipe.cuisine
      ? recipe.cuisine.length % colors.length
      : 0;
    return colors[index];
  };

  /**
   * Handle favorite toggle
   */
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(recipe.id);
    }
  };

  return (
    <div
      onClick={onClick}
      className="group relative bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-emerald-100 to-green-100 overflow-hidden">
        {recipe.image_url && !imageError ? (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ChefHat className="w-16 h-16 text-emerald-300" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border transition-all duration-200 ${
              isFavorited
                ? 'bg-red-500 border-red-600 text-white'
                : 'bg-white/80 border-white text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart
              className="w-5 h-5"
              fill={isFavorited ? 'currentColor' : 'none'}
            />
          </button>
        )}

        {/* Source Badge */}
        {showSource && (
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-emerald-200 text-xs font-bold text-emerald-700">
            {recipe.source === 'ai' ? '✨ AI' : recipe.source === 'api' ? '🌐 API' : '👤 Manual'}
          </div>
        )}

        {/* Difficulty Badge */}
        <div
          className={`absolute bottom-3 left-3 px-3 py-1.5 rounded-full border ${getDifficultyColor()} text-xs font-bold shadow-md capitalize`}
        >
          {recipe.difficulty}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-lg font-bold text-emerald-900 mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors">
            {recipe.title}
          </h3>
          {recipe.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {recipe.description}
            </p>
          )}
        </div>

        {/* Cuisine Badge */}
        {recipe.cuisine && (
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${getCuisineBadgeColor()}`}
            >
              {recipe.cuisine.split('-').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </span>
          </div>
        )}

        {/* Time Indicators */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {/* Total Time */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Time</p>
              <p className="font-bold text-gray-900">
                {formatCookingTime(totalTime)}
              </p>
            </div>
          </div>

          {/* Servings */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Servings</p>
              <p className="font-bold text-gray-900">{recipe.servings}</p>
            </div>
          </div>
        </div>

        {/* User Recipe Metadata */}
        {userRecipe && (
          <div className="pt-3 border-t border-gray-100 space-y-2">
            {/* Rating */}
            {userRecipe.rating && (
              <div className="flex items-center gap-2 text-xs">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-semibold text-gray-700">
                  {userRecipe.rating}/5
                </span>
              </div>
            )}

            {/* Last Cooked */}
            {userRecipe.last_cooked_at && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  Cooked {userRecipe.cooked_count} time
                  {userRecipe.cooked_count !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Ingredients Count */}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-600">
            {recipe.ingredients.length} ingredient
            {recipe.ingredients.length !== 1 ? 's' : ''} • {recipe.instructions.length} step
            {recipe.instructions.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
