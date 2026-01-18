/**
 * Recipe Detail Modal Component
 *
 * Full recipe view modal with ingredients, instructions, and inventory integration.
 * Shows which ingredients user has in inventory.
 */

import { useState } from 'react';
import {
  X,
  Clock,
  Users,
  ChefHat,
  Heart,
  Star,
  Check,
  AlertCircle,
  ShoppingCart,
  Edit,
} from 'lucide-react';
import type { RecipeWithDetails, UserRecipe } from '../../types/database';
import { formatCookingTime } from '../../types/database';
import { useInventoryStore } from '../../stores/inventoryStore';

interface RecipeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: RecipeWithDetails;
  userRecipe?: UserRecipe;
  onToggleFavorite?: (recipeId: string) => void;
  onSaveRecipe?: (recipeId: string) => void;
  onUnsaveRecipe?: (recipeId: string) => void;
  onAddMissingToCart?: (ingredients: string[]) => void;
  onEdit?: (recipe: RecipeWithDetails) => void;
  isOwner?: boolean;
}

export default function RecipeDetailModal({
  isOpen,
  onClose,
  recipe,
  userRecipe,
  onToggleFavorite,
  onSaveRecipe,
  onUnsaveRecipe,
  onAddMissingToCart,
  onEdit,
  isOwner = false,
}: RecipeDetailModalProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(
    new Set()
  );
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions'>(
    'ingredients'
  );

  const { items: inventoryItems } = useInventoryStore();

  if (!isOpen) return null;

  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);
  const isSaved = !!userRecipe;
  const isFavorited = userRecipe?.is_favorite || false;

  /**
   * Check if user has ingredient in inventory
   */
  const hasIngredient = (ingredientName: string): boolean => {
    return inventoryItems.some((item) =>
      item.name.toLowerCase().includes(ingredientName.toLowerCase())
    );
  };

  /**
   * Get missing ingredients
   */
  const missingIngredients = recipe.ingredients
    .filter((ing) => !hasIngredient(ing.name))
    .map((ing) => ing.name);

  /**
   * Toggle ingredient checkbox
   */
  const toggleIngredient = (index: number) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedIngredients(newChecked);
  };

  /**
   * Handle add missing to cart
   */
  const handleAddMissing = () => {
    if (onAddMissingToCart && missingIngredients.length > 0) {
      onAddMissingToCart(missingIngredients);
    }
  };

  /**
   * Get difficulty color
   */
  const getDifficultyColor = () => {
    switch (recipe.difficulty) {
      case 'easy':
        return 'text-emerald-700 bg-emerald-100';
      case 'medium':
        return 'text-amber-700 bg-amber-100';
      case 'hard':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-slide-in-bottom">
        {/* Header with Image */}
        <div className="relative h-64 bg-gradient-to-br from-emerald-100 to-green-100">
          {recipe.image_url ? (
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ChefHat className="w-24 h-24 text-emerald-300" />
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full transition-colors shadow-lg"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>

          {/* Action Buttons */}
          <div className="absolute top-4 left-4 flex gap-2">
            {/* Favorite Button */}
            {onToggleFavorite && isSaved && (
              <button
                onClick={() => onToggleFavorite(recipe.id)}
                className={`p-2 rounded-full backdrop-blur-md border transition-all duration-200 ${
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

            {/* Edit Button (if owner) */}
            {isOwner && onEdit && (
              <button
                onClick={() => onEdit(recipe)}
                className="p-2 bg-white/90 hover:bg-white rounded-full transition-colors shadow-lg"
              >
                <Edit className="w-5 h-5 text-emerald-700" />
              </button>
            )}
          </div>

          {/* Title */}
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
              {recipe.title}
            </h2>
            {recipe.description && (
              <p className="text-white/90 text-sm drop-shadow-md line-clamp-2">
                {recipe.description}
              </p>
            )}
          </div>
        </div>

        {/* Metadata Bar */}
        <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4">
              {/* Total Time */}
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-semibold text-gray-700">
                  {formatCookingTime(totalTime)}
                </span>
              </div>

              {/* Servings */}
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-semibold text-gray-700">
                  {recipe.servings} servings
                </span>
              </div>

              {/* Difficulty */}
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getDifficultyColor()}`}
              >
                {recipe.difficulty}
              </div>

              {/* Cuisine */}
              {recipe.cuisine && (
                <div className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 capitalize">
                  {recipe.cuisine.split('-').join(' ')}
                </div>
              )}
            </div>

            {/* Save/Unsave Button */}
            <div>
              {!isSaved && onSaveRecipe && (
                <button
                  onClick={() => onSaveRecipe(recipe.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors"
                >
                  Save Recipe
                </button>
              )}
              {isSaved && onUnsaveRecipe && (
                <button
                  onClick={() => onUnsaveRecipe(recipe.id)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-bold rounded-lg transition-colors"
                >
                  Unsave
                </button>
              )}
            </div>
          </div>

          {/* User Rating */}
          {userRecipe?.rating && (
            <div className="mt-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="text-sm font-semibold text-gray-700">
                Your Rating: {userRecipe.rating}/5
              </span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`pb-3 px-2 font-bold text-sm transition-all duration-200 ${
                activeTab === 'ingredients'
                  ? 'text-emerald-700 border-b-2 border-emerald-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Ingredients ({recipe.ingredients.length})
            </button>
            <button
              onClick={() => setActiveTab('instructions')}
              className={`pb-3 px-2 font-bold text-sm transition-all duration-200 ${
                activeTab === 'instructions'
                  ? 'text-emerald-700 border-b-2 border-emerald-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Instructions ({recipe.instructions.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {activeTab === 'ingredients' ? (
            <div className="space-y-4">
              {/* Missing Ingredients Alert */}
              {missingIngredients.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-bold text-amber-900 mb-1">
                      Missing {missingIngredients.length} ingredient
                      {missingIngredients.length !== 1 ? 's' : ''}
                    </h4>
                    <p className="text-sm text-amber-700 mb-3">
                      Add them to your shopping list to get started.
                    </p>
                    {onAddMissingToCart && (
                      <button
                        onClick={handleAddMissing}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add Missing to Cart</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Ingredients List */}
              <div className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => {
                  const hasIt = hasIngredient(ingredient.name);
                  const isChecked = checkedIngredients.has(index);

                  return (
                    <div
                      key={index}
                      onClick={() => toggleIngredient(index)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                        isChecked
                          ? 'bg-emerald-50 border border-emerald-200'
                          : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {/* Checkbox */}
                      <div
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                          isChecked
                            ? 'bg-emerald-600 border-emerald-600'
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        {isChecked && <Check className="w-4 h-4 text-white" />}
                      </div>

                      {/* Ingredient Info */}
                      <div className="flex-1">
                        <p
                          className={`font-semibold ${
                            isChecked
                              ? 'text-gray-500 line-through'
                              : 'text-gray-900'
                          }`}
                        >
                          {ingredient.quantity} {ingredient.unit}{' '}
                          {ingredient.name}
                        </p>
                        {ingredient.notes && (
                          <p className="text-xs text-gray-600 mt-0.5">
                            {ingredient.notes}
                          </p>
                        )}
                      </div>

                      {/* Inventory Status */}
                      <div>
                        {hasIt ? (
                          <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 rounded-full">
                            <Check className="w-3 h-3 text-emerald-700" />
                            <span className="text-xs font-bold text-emerald-700">
                              In Stock
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 px-2 py-1 bg-red-100 rounded-full">
                            <X className="w-3 h-3 text-red-700" />
                            <span className="text-xs font-bold text-red-700">
                              Need
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Instructions List */}
              {recipe.instructions.map((instruction, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
                >
                  {/* Step Number */}
                  <div className="flex-shrink-0 w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {instruction.step}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1">
                    <p className="text-gray-900 leading-relaxed">
                      {instruction.description}
                    </p>

                    {/* Duration & Temperature */}
                    <div className="mt-2 flex flex-wrap gap-3">
                      {instruction.duration_minutes && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{instruction.duration_minutes} min</span>
                        </div>
                      )}
                      {instruction.temperature && (
                        <div className="text-xs text-gray-600">
                          {instruction.temperature.value}°
                          {instruction.temperature.unit === 'celsius'
                            ? 'C'
                            : 'F'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Nutritional Info (if available) */}
        {/* TODO: Add nutritional_info field to database schema and uncomment */}
        {/* {recipe.nutritional_info && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <h4 className="font-bold text-gray-900 mb-3 text-sm">
              Nutritional Information (per serving)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              {recipe.nutritional_info.calories && (
                <div>
                  <p className="text-gray-600">Calories</p>
                  <p className="font-bold text-gray-900">
                    {recipe.nutritional_info.calories}
                  </p>
                </div>
              )}
              {recipe.nutritional_info.protein_g && (
                <div>
                  <p className="text-gray-600">Protein</p>
                  <p className="font-bold text-gray-900">
                    {recipe.nutritional_info.protein_g}g
                  </p>
                </div>
              )}
              {recipe.nutritional_info.carbs_g && (
                <div>
                  <p className="text-gray-600">Carbs</p>
                  <p className="font-bold text-gray-900">
                    {recipe.nutritional_info.carbs_g}g
                  </p>
                </div>
              )}
              {recipe.nutritional_info.fat_g && (
                <div>
                  <p className="text-gray-600">Fat</p>
                  <p className="font-bold text-gray-900">
                    {recipe.nutritional_info.fat_g}g
                  </p>
                </div>
              )}
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}
