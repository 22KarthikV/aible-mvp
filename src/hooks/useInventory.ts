/**
 * useInventory Hook
 *
 * Comprehensive hook for managing inventory data with filtering and CRUD operations.
 * Combines inventory store functionality with computed values and filter management.
 *
 * @example
 * const {
 *   items,
 *   filteredItems,
 *   loading,
 *   addItem,
 *   updateItem,
 *   deleteItem,
 *   filters,
 *   setFilters
 * } = useInventory(userId);
 */

import { useEffect, useMemo, useCallback } from 'react';
import { useInventoryStore } from '../stores/inventoryStore';
import {
  fetchInventoryItems,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
} from '../services/inventoryService';
import type {
  InventoryItemWithStatus,
  UUID,
  StorageLocation
} from '../types/database';
import type {
  CreateInventoryItemFormData,
  UpdateInventoryItemFormData
} from '../schemas/inventorySchemas';

interface InventoryFilters {
  searchQuery: string;
  selectedCategory: string | null;
  selectedLocation: StorageLocation | null;
  showExpiredOnly: boolean;
  showExpiringSoon: boolean;
}

interface UseInventoryReturn {
  // Data state
  items: InventoryItemWithStatus[];
  filteredItems: InventoryItemWithStatus[];
  loading: boolean;
  error: string | null;

  // Filter state
  filters: InventoryFilters;

  // Computed values
  totalItems: number;
  expiredCount: number;
  expiringSoonCount: number;

  // Actions
  addItem: (item: CreateInventoryItemFormData) => Promise<void>;
  updateItem: (id: UUID, updates: UpdateInventoryItemFormData) => Promise<void>;
  deleteItem: (id: UUID) => Promise<void>;
  setFilters: (filters: Partial<InventoryFilters>) => void;
  clearFilters: () => void;
  refreshItems: () => Promise<void>;
}

export function useInventory(userId: string): UseInventoryReturn {
  // Access inventory store
  const {
    loading,
    error,
    items,
    searchQuery,
    selectedCategory,
    selectedLocation,
    showExpiredOnly,
    showExpiringSoon,
    setItems,
    setLoading,
    setError,
    setSearchQuery,
    setSelectedCategory,
    setSelectedLocation,
    setShowExpiredOnly,
    setShowExpiringSoon,
    clearFilters: storeClearFilters,
    getFilteredItems,
    getStats,
    addItem: addItemToStore,
    updateItem: updateItemInStore,
    deleteItem: deleteItemFromStore,
  } = useInventoryStore();

  // Get filtered items and stats
  const filteredItems = useMemo(() => getFilteredItems(), [getFilteredItems]);
  const stats = useMemo(() => getStats(), [getStats]);

  /**
   * Fetch inventory items on mount or when userId changes
   */
  const fetchItems = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    const { data, error } = await fetchInventoryItems(userId);

    if (error) {
      setError(error);
      setLoading(false);
      return;
    }

    if (data) {
      setItems(data);
    }
    setLoading(false);
  }, [userId, setItems, setLoading, setError]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  /**
   * Add new inventory item
   */
  const addItem = useCallback(
    async (itemData: CreateInventoryItemFormData) => {
      // Convert undefined to null for optional fields
      const cleanedData = {
        ...itemData,
        user_id: userId as UUID,
        expiry_date: itemData.expiry_date || null,
        purchase_date: itemData.purchase_date || null,
        barcode: itemData.barcode || null,
        image_url: itemData.image_url || null,
        notes: itemData.notes || null,
      };

      const { data: newItem, error } = await createInventoryItem(cleanedData);

      if (error) {
        throw new Error(error);
      }

      if (newItem) {
        addItemToStore(newItem);
      }
    },
    [userId, addItemToStore]
  );

  /**
   * Update existing inventory item
   */
  const updateItem = useCallback(
    async (itemId: UUID, updates: UpdateInventoryItemFormData) => {
      const { data: updatedItem, error } = await updateInventoryItem(
        itemId,
        updates
      );

      if (error) {
        throw new Error(error);
      }

      if (updatedItem) {
        updateItemInStore(itemId, updatedItem);
      }
    },
    [updateItemInStore]
  );

  /**
   * Delete inventory item
   */
  const deleteItem = useCallback(
    async (itemId: UUID) => {
      const { error } = await deleteInventoryItem(itemId);

      if (error) {
        throw new Error(error);
      }

      deleteItemFromStore(itemId);
    },
    [deleteItemFromStore]
  );

  /**
   * Update filters
   */
  const setFilters = useCallback(
    (newFilters: Partial<InventoryFilters>) => {
      if (newFilters.searchQuery !== undefined) {
        setSearchQuery(newFilters.searchQuery);
      }
      if (newFilters.selectedCategory !== undefined) {
        setSelectedCategory(newFilters.selectedCategory);
      }
      if (newFilters.selectedLocation !== undefined) {
        setSelectedLocation(newFilters.selectedLocation);
      }
      if (newFilters.showExpiredOnly !== undefined) {
        setShowExpiredOnly(newFilters.showExpiredOnly);
      }
      if (newFilters.showExpiringSoon !== undefined) {
        setShowExpiringSoon(newFilters.showExpiringSoon);
      }
    },
    [
      setSearchQuery,
      setSelectedCategory,
      setSelectedLocation,
      setShowExpiredOnly,
      setShowExpiringSoon,
    ]
  );

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    storeClearFilters();
  }, [storeClearFilters]);

  /**
   * Refresh items from server
   */
  const refreshItems = useCallback(async () => {
    await fetchItems();
  }, [fetchItems]);

  // Combine filters into single object
  const filters: InventoryFilters = useMemo(
    () => ({
      searchQuery,
      selectedCategory,
      selectedLocation,
      showExpiredOnly,
      showExpiringSoon,
    }),
    [
      searchQuery,
      selectedCategory,
      selectedLocation,
      showExpiredOnly,
      showExpiringSoon,
    ]
  );

  return {
    // Data state
    items,
    filteredItems,
    loading,
    error,

    // Filter state
    filters,

    // Computed values
    totalItems: stats.total,
    expiredCount: stats.expired,
    expiringSoonCount: stats.expiringSoon,

    // Actions
    addItem,
    updateItem,
    deleteItem,
    setFilters,
    clearFilters,
    refreshItems,
  };
}
