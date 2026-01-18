/**
 * Inventory Filters Component
 *
 * Provides filtering options for inventory items by category, location, and expiry status.
 * Features a clean, glassmorphic design with quick filter chips.
 *
 * NOTE: This is a controlled component. Parent component (Inventory.tsx) handles visibility.
 * The filter toggle button is in the parent, not here, to avoid duplication.
 */

import { X, AlertCircle, Clock } from 'lucide-react';
import { CATEGORY_OPTIONS, LOCATION_OPTIONS } from '../../schemas/inventorySchemas';
import type { StorageLocation } from '../../types/database';

interface InventoryFiltersProps {
  selectedCategory: string | null;
  selectedLocation: StorageLocation | null;
  showExpiredOnly: boolean;
  showExpiringSoon: boolean;
  onCategoryChange: (category: string | null) => void;
  onLocationChange: (location: StorageLocation | null) => void;
  onShowExpiredOnlyChange: (show: boolean) => void;
  onShowExpiringSoonChange: (show: boolean) => void;
  onClearFilters: () => void;
}

export default function InventoryFilters({
  selectedCategory,
  selectedLocation,
  showExpiredOnly,
  showExpiringSoon,
  onCategoryChange,
  onLocationChange,
  onShowExpiredOnlyChange,
  onShowExpiringSoonChange,
  onClearFilters,
}: InventoryFiltersProps) {
  /**
   * Check if any filters are active
   * Used to show/hide the "Clear All" button
   */
  const hasActiveFilters =
    selectedCategory !== null ||
    selectedLocation !== null ||
    showExpiredOnly ||
    showExpiringSoon;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Filter Panel - Always visible when component is rendered */}
      <div className="bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-2xl p-6 shadow-md">
        {/* Header with Clear All button */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-emerald-100">
            <h3 className="text-sm font-bold text-emerald-700">
              Active Filters ({[selectedCategory !== null, selectedLocation !== null, showExpiredOnly, showExpiringSoon].filter(Boolean).length})
            </h3>
            <button
              onClick={onClearFilters}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-sm"
            >
              <X className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          </div>
        )}

        <div className="space-y-6">
            {/* Quick Filters - Expiry Status */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">
                Quick Filters
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onShowExpiringSoonChange(!showExpiringSoon)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all ${
                    showExpiringSoon
                      ? 'bg-amber-100 text-amber-700 border-2 border-amber-300 shadow-md'
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-amber-50 hover:text-amber-600'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Expiring Soon</span>
                </button>
                <button
                  onClick={() => onShowExpiredOnlyChange(!showExpiredOnly)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all ${
                    showExpiredOnly
                      ? 'bg-red-100 text-red-700 border-2 border-red-300 shadow-md'
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Expired</span>
                </button>
              </div>
            </div>

            {/* Location Filter */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">
                Storage Location
              </h3>
              <div className="flex flex-wrap gap-2">
                {LOCATION_OPTIONS.map((location) => (
                  <button
                    key={location.value}
                    onClick={() =>
                      onLocationChange(
                        selectedLocation === location.value
                          ? null
                          : location.value
                      )
                    }
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all ${
                      selectedLocation === location.value
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300 shadow-md'
                        : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    <span className="text-lg">{location.icon}</span>
                    <span>{location.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">Category</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {CATEGORY_OPTIONS.map((category) => (
                  <button
                    key={category.value}
                    onClick={() =>
                      onCategoryChange(
                        selectedCategory === category.value
                          ? null
                          : category.value
                      )
                    }
                    className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                      selectedCategory === category.value
                        ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300 shadow-md'
                        : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-emerald-50 hover:text-emerald-600'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
