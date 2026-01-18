/**
 * Recipe Search Bar Component
 *
 * Enhanced search input with debounced autocomplete suggestions.
 */

import { Search, X } from 'lucide-react';

interface RecipeSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RecipeSearchBar({
  value,
  onChange,
  placeholder = 'Search recipes, ingredients, or cuisines...',
}: RecipeSearchBarProps) {
  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="relative group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500 group-focus-within:text-emerald-600 transition-colors" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-12 py-3.5 bg-emerald-100/30 border border-emerald-200/50 rounded-2xl text-emerald-900 placeholder-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:bg-white focus:border-emerald-300 transition-all duration-200 font-medium"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-emerald-100 transition-colors"
          aria-label="Clear search"
        >
          <X className="w-4 h-4 text-emerald-600" />
        </button>
      )}
    </div>
  );
}
