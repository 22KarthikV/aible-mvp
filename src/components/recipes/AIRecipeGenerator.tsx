/**
 * AI Recipe Generator Component
 *
 * Interface for generating recipes from inventory using AI.
 * Allows users to select ingredients and preferences.
 */

import { useState } from 'react';
import { Sparkles, Loader2, Check, ChefHat } from 'lucide-react';
import { useInventoryStore } from '../../stores/inventoryStore';
import type { CuisineType, RecipeDifficulty } from '../../types/database';

interface AIRecipeGeneratorProps {
  onGenerate: (params: {
    ingredients: string[];
    cuisine?: CuisineType;
    difficulty?: RecipeDifficulty;
  }) => Promise<void>;
  loading?: boolean;
}

const CUISINES: CuisineType[] = [
  'italian',
  'chinese',
  'indian',
  'mexican',
  'japanese',
  'thai',
  'mediterranean',
  'american',
];

const DIFFICULTIES: RecipeDifficulty[] = ['easy', 'medium', 'hard'];

export default function AIRecipeGenerator({
  onGenerate,
  loading = false,
}: AIRecipeGeneratorProps) {
  const { items: inventoryItems } = useInventoryStore();
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(
    new Set()
  );
  const [selectedCuisine, setSelectedCuisine] = useState<CuisineType | undefined>();
  const [selectedDifficulty, setSelectedDifficulty] = useState<RecipeDifficulty | undefined>();

  /**
   * Toggle ingredient selection
   */
  const toggleIngredient = (ingredientName: string) => {
    const newSelected = new Set(selectedIngredients);
    if (newSelected.has(ingredientName)) {
      newSelected.delete(ingredientName);
    } else {
      newSelected.add(ingredientName);
    }
    setSelectedIngredients(newSelected);
  };

  /**
   * Select all ingredients
   */
  const selectAll = () => {
    setSelectedIngredients(new Set(inventoryItems.map((item) => item.name)));
  };

  /**
   * Clear selection
   */
  const clearSelection = () => {
    setSelectedIngredients(new Set());
  };

  /**
   * Handle generate click
   */
  const handleGenerate = async () => {
    if (selectedIngredients.size === 0) {
      alert('Please select at least one ingredient');
      return;
    }

    await onGenerate({
      ingredients: Array.from(selectedIngredients),
      cuisine: selectedCuisine,
      difficulty: selectedDifficulty,
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-emerald-100 p-8 shadow-sm">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-emerald-900 mb-2">
          Generate Recipe with AI
        </h3>
        <p className="text-emerald-700">
          Select ingredients from your inventory and let AI create a personalized
          recipe
        </p>
      </div>

      {/* Ingredients Selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold text-gray-900">
            Select Ingredients ({selectedIngredients.size} selected)
          </h4>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="px-3 py-1 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
            >
              Select All
            </button>
            <button
              onClick={clearSelection}
              className="px-3 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {inventoryItems.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">
              No items in inventory. Add items to generate recipes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-2">
            {inventoryItems.map((item) => {
              const isSelected = selectedIngredients.has(item.name);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleIngredient(item.name)}
                  className={`flex items-center gap-2 p-3 rounded-xl text-left transition-all duration-200 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? 'bg-white border-white'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    {isSelected && (
                      <Check className="w-3 h-3 text-emerald-600" />
                    )}
                  </div>
                  <span className="text-sm font-semibold truncate">
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Cuisine Preference */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-gray-900 mb-3">
          Cuisine Preference (Optional)
        </h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCuisine(undefined)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              !selectedCuisine
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Any
          </button>
          {CUISINES.map((cuisine) => (
            <button
              key={cuisine}
              onClick={() => setSelectedCuisine(cuisine)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 capitalize ${
                selectedCuisine === cuisine
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cuisine.split('-').join(' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Preference */}
      <div className="mb-8">
        <h4 className="text-sm font-bold text-gray-900 mb-3">
          Difficulty (Optional)
        </h4>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedDifficulty(undefined)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              !selectedDifficulty
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Any
          </button>
          {DIFFICULTIES.map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => setSelectedDifficulty(difficulty)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 capitalize ${
                selectedDifficulty === difficulty
                  ? difficulty === 'easy'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : difficulty === 'medium'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-red-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {difficulty}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={loading || selectedIngredients.size === 0}
        className="w-full group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-200 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Generating Recipe...</span>
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
            <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
            <span>Generate Recipe</span>
          </>
        )}
      </button>

      {/* Info */}
      <p className="text-center text-xs text-gray-500 mt-4">
        AI will create a recipe based on your selected ingredients and
        preferences
      </p>
    </div>
  );
}
