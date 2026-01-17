/**
 * Inventory Store
 *
 * Manages inventory state using Zustand for performance and real-time updates.
 * Handles CRUD operations and filtering for kitchen inventory items.
 */

import { create } from 'zustand';
import type {
  InventoryItem,
  InventoryItemWithStatus,
  StorageLocation,
} from '../types/database';
import { getExpiryStatus, calculateDaysUntilExpiry } from '../types/database';

interface InventoryState {
  // Data
  items: InventoryItemWithStatus[];
  loading: boolean;
  error: string | null;

  // Filters
  searchQuery: string;
  selectedCategory: string | null;
  selectedLocation: StorageLocation | null;
  showExpiredOnly: boolean;
  showExpiringSoon: boolean;

  // Actions - Data Management
  setItems: (items: InventoryItem[]) => void;
  addItem: (item: InventoryItem) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Actions - Filters
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setSelectedLocation: (location: StorageLocation | null) => void;
  setShowExpiredOnly: (show: boolean) => void;
  setShowExpiringSoon: (show: boolean) => void;
  clearFilters: () => void;

  // Computed - Filtered Items
  getFilteredItems: () => InventoryItemWithStatus[];

  // Computed - Statistics
  getStats: () => {
    total: number;
    expired: number;
    expiringSoon: number;
    byLocation: Record<StorageLocation, number>;
  };
}

/**
 * Add expiry status to inventory item
 */
function enrichInventoryItem(item: InventoryItem): InventoryItemWithStatus {
  const daysUntilExpiry = calculateDaysUntilExpiry(item.expiry_date);
  const expiryStatus = getExpiryStatus(daysUntilExpiry);

  return {
    ...item,
    days_until_expiry: daysUntilExpiry,
    expiry_status: expiryStatus,
  };
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  // Initial State
  items: [],
  loading: false,
  error: null,
  searchQuery: '',
  selectedCategory: null,
  selectedLocation: null,
  showExpiredOnly: false,
  showExpiringSoon: false,

  // Data Management Actions
  setItems: (items) =>
    set({ items: items.map(enrichInventoryItem), error: null }),

  addItem: (item) =>
    set((state) => ({
      items: [...state.items, enrichInventoryItem(item)],
      error: null,
    })),

  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? enrichInventoryItem({ ...item, ...updates }) : item
      ),
      error: null,
    })),

  deleteItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
      error: null,
    })),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Filter Actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedLocation: (location) => set({ selectedLocation: location }),
  setShowExpiredOnly: (show) => set({ showExpiredOnly: show }),
  setShowExpiringSoon: (show) => set({ showExpiringSoon: show }),
  clearFilters: () =>
    set({
      searchQuery: '',
      selectedCategory: null,
      selectedLocation: null,
      showExpiredOnly: false,
      showExpiringSoon: false,
    }),

  // Filtered Items (Computed)
  getFilteredItems: () => {
    const {
      items,
      searchQuery,
      selectedCategory,
      selectedLocation,
      showExpiredOnly,
      showExpiringSoon,
    } = get();

    let filtered = [...items];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.notes?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    // Location filter
    if (selectedLocation) {
      filtered = filtered.filter((item) => item.location === selectedLocation);
    }

    // Expired filter
    if (showExpiredOnly) {
      filtered = filtered.filter((item) => item.expiry_status === 'expired');
    }

    // Expiring soon filter
    if (showExpiringSoon) {
      filtered = filtered.filter(
        (item) => item.expiry_status === 'expiring_soon'
      );
    }

    // Sort by expiry date (expired first, then expiring soon, then by date)
    filtered.sort((a, b) => {
      // Expired items first
      if (a.expiry_status === 'expired' && b.expiry_status !== 'expired')
        return -1;
      if (b.expiry_status === 'expired' && a.expiry_status !== 'expired')
        return 1;

      // Expiring soon items second
      if (
        a.expiry_status === 'expiring_soon' &&
        b.expiry_status !== 'expiring_soon'
      )
        return -1;
      if (
        b.expiry_status === 'expiring_soon' &&
        a.expiry_status !== 'expiring_soon'
      )
        return 1;

      // Sort by expiry date
      if (a.expiry_date && b.expiry_date) {
        return (
          new Date(a.expiry_date).getTime() -
          new Date(b.expiry_date).getTime()
        );
      }
      if (a.expiry_date && !b.expiry_date) return -1;
      if (!a.expiry_date && b.expiry_date) return 1;

      // Sort by name if no expiry date
      return a.name.localeCompare(b.name);
    });

    return filtered;
  },

  // Statistics (Computed)
  getStats: () => {
    const { items } = get();

    const total = items.length;
    const expired = items.filter(
      (item) => item.expiry_status === 'expired'
    ).length;
    const expiringSoon = items.filter(
      (item) => item.expiry_status === 'expiring_soon'
    ).length;

    const byLocation: Record<StorageLocation, number> = {
      fridge: items.filter((item) => item.location === 'fridge').length,
      freezer: items.filter((item) => item.location === 'freezer').length,
      pantry: items.filter((item) => item.location === 'pantry').length,
    };

    return {
      total,
      expired,
      expiringSoon,
      byLocation,
    };
  },
}));
