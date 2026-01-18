/**
 * Empty Search Results Component
 *
 * Displayed when search/filter yields no results.
 */

import { Search, X } from 'lucide-react';

interface EmptySearchProps {
  searchQuery?: string;
  onClearFilters: () => void;
}

export default function EmptySearch({ searchQuery, onClearFilters }: EmptySearchProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-12 text-center animate-fade-in">
      {/* Icon */}
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Search className="w-8 h-8 text-gray-400" />
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        No recipes found
      </h3>
      <p className="text-gray-600 mb-6">
        {searchQuery
          ? `No results for "${searchQuery}". Try adjusting your search or filters.`
          : 'Try adjusting your filters to see more recipes.'}
      </p>

      {/* Clear Filters Button */}
      <button
        onClick={onClearFilters}
        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors focus:outline-none focus:ring-4 focus:ring-emerald-200"
      >
        <X className="w-4 h-4" />
        <span>Clear Filters</span>
      </button>
    </div>
  );
}
