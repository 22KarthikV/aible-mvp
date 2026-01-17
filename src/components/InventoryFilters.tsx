/**
 * Inventory Filters Component
 *
 * Provides filtering options for inventory items by category, location, and expiry status.
 * Features a clean, glassmorphic design with quick filter chips.
 */

import { Filter, X, AlertCircle, Clock } from 'lucide-react';
import { useState } from 'react';
import { CATEGORY_OPTIONS, LOCATION_OPTIONS } from '../schemas/inventorySchemas';
import type { StorageLocation } from '../types/database';

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
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Check if any filters are active
   */
  const hasActiveFilters =
    selectedCategory !== null ||
    selectedLocation !== null ||
    showExpiredOnly ||
    showExpiringSoon;

  /**
   * Handle filter toggle
   */
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleToggle}
          className="flex items-center gap-2 px-5 py-3 bg-white border border-emerald-200 text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 hover:border-emerald-300 shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-100"
        >
          <Filter className="w-5 h-5" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full">
              {
                [
                  selectedCategory !== null,
                  selectedLocation !== null,
                  showExpiredOnly,
                  showExpiringSoon,
                ].filter(Boolean).length
              }
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {isOpen && (
        <div className="bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-2xl p-6 shadow-md animate-fade-in">
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
      )}
    </div>
  );
}
