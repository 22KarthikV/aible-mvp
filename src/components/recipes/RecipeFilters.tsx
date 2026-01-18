/**
 * Recipe Filters Component
 *
 * Filter panel for cuisine, difficulty, time, and dietary tags.
 */

import { X } from 'lucide-react';
import type { CuisineType, RecipeDifficulty } from '../../types/database';

interface RecipeFiltersProps {
  selectedCuisine: CuisineType | null;
  selectedDifficulty: RecipeDifficulty | null;
  selectedTimeRange: 'under-30' | '30-60' | 'over-60' | null;
  dietaryTags: string[];
  onCuisineChange: (cuisine: CuisineType | null) => void;
  onDifficultyChange: (difficulty: RecipeDifficulty | null) => void;
  onTimeRangeChange: (range: 'under-30' | '30-60' | 'over-60' | null) => void;
  onDietaryTagsChange: (tags: string[]) => void;
  onClearFilters: () => void;
}

const CUISINES: CuisineType[] = [
  'italian',
  'chinese',
  'indian',
  'mexican',
  'japanese',
  'thai',
  'french',
  'mediterranean',
  'american',
  'korean',
];

const DIFFICULTIES: RecipeDifficulty[] = ['easy', 'medium', 'hard'];

const TIME_RANGES = [
  { value: 'under-30' as const, label: 'Under 30 min' },
  { value: '30-60' as const, label: '30-60 min' },
  { value: 'over-60' as const, label: 'Over 60 min' },
];

const DIETARY_TAGS = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'nut-free',
];

export default function RecipeFilters({
  selectedCuisine,
  selectedDifficulty,
  selectedTimeRange,
  dietaryTags,
  onCuisineChange,
  onDifficultyChange,
  onTimeRangeChange,
  onDietaryTagsChange,
  onClearFilters,
}: RecipeFiltersProps) {
  const hasActiveFilters =
    selectedCuisine !== null ||
    selectedDifficulty !== null ||
    selectedTimeRange !== null ||
    dietaryTags.length > 0;

  const toggleDietaryTag = (tag: string) => {
    if (dietaryTags.includes(tag)) {
      onDietaryTagsChange(dietaryTags.filter((t) => t !== tag));
    } else {
      onDietaryTagsChange([...dietaryTags, tag]);
    }
  };

  return (
    <div className="mt-4 bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-2xl p-6 shadow-sm animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-emerald-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Cuisine Filter */}
        <div>
          <h4 className="text-sm font-bold text-gray-700 mb-3">Cuisine</h4>
          <div className="flex flex-wrap gap-2">
            {CUISINES.map((cuisine) => (
              <button
                key={cuisine}
                onClick={() =>
                  onCuisineChange(selectedCuisine === cuisine ? null : cuisine)
                }
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  selectedCuisine === cuisine
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                {cuisine.split('-').map(word =>
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Filter */}
        <div>
          <h4 className="text-sm font-bold text-gray-700 mb-3">Difficulty</h4>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map((difficulty) => (
              <button
                key={difficulty}
                onClick={() =>
                  onDifficultyChange(
                    selectedDifficulty === difficulty ? null : difficulty
                  )
                }
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 capitalize ${
                  selectedDifficulty === difficulty
                    ? difficulty === 'easy'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : difficulty === 'medium'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-red-600 text-white shadow-md'
                    : difficulty === 'easy'
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : difficulty === 'medium'
                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                {difficulty}
              </button>
            ))}
          </div>
        </div>

        {/* Time Range Filter */}
        <div>
          <h4 className="text-sm font-bold text-gray-700 mb-3">
            Cooking Time
          </h4>
          <div className="flex flex-wrap gap-2">
            {TIME_RANGES.map((range) => (
              <button
                key={range.value}
                onClick={() =>
                  onTimeRangeChange(
                    selectedTimeRange === range.value ? null : range.value
                  )
                }
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  selectedTimeRange === range.value
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dietary Tags Filter */}
        <div>
          <h4 className="text-sm font-bold text-gray-700 mb-3">Dietary</h4>
          <div className="flex flex-wrap gap-2">
            {DIETARY_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleDietaryTag(tag)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 capitalize ${
                  dietaryTags.includes(tag)
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
