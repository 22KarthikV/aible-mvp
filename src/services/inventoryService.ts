/**
 * Inventory Service
 *
 * Handles all Supabase operations for inventory management.
 * Provides CRUD operations with proper error handling and type safety.
 */

import { supabase } from '../lib/supabase';
import type {
  InventoryItem,
  InventoryItemInput,
  InventoryItemUpdate,
  UUID,
} from '../types/database';

// ============================================================================
// ERROR HANDLING
// ============================================================================

interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
}

/**
 * Handle Supabase errors with user-friendly messages
 */
function handleError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

// ============================================================================
// FETCH OPERATIONS
// ============================================================================

/**
 * Fetch all inventory items for a user
 */
export async function fetchInventoryItems(
  userId: UUID
): Promise<ServiceResponse<InventoryItem[]>> {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching inventory items:', error);
      return { data: null, error: handleError(error) };
    }

    return { data: data as InventoryItem[], error: null };
  } catch (error) {
    console.error('Unexpected error fetching inventory items:', error);
    return { data: null, error: handleError(error) };
  }
}

/**
 * Fetch a single inventory item by ID
 */
export async function fetchInventoryItem(
  itemId: UUID
): Promise<ServiceResponse<InventoryItem>> {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (error) {
      console.error('Error fetching inventory item:', error);
      return { data: null, error: handleError(error) };
    }

    return { data: data as InventoryItem, error: null };
  } catch (error) {
    console.error('Unexpected error fetching inventory item:', error);
    return { data: null, error: handleError(error) };
  }
}

/**
 * Fetch items expiring within a specified number of days
 */
export async function fetchExpiringItems(
  userId: UUID,
  daysThreshold: number = 3
): Promise<ServiceResponse<InventoryItem[]>> {
  try {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysThreshold);

    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('user_id', userId)
      .not('expiry_date', 'is', null)
      .lte('expiry_date', targetDate.toISOString())
      .order('expiry_date', { ascending: true });

    if (error) {
      console.error('Error fetching expiring items:', error);
      return { data: null, error: handleError(error) };
    }

    return { data: data as InventoryItem[], error: null };
  } catch (error) {
    console.error('Unexpected error fetching expiring items:', error);
    return { data: null, error: handleError(error) };
  }
}

/**
 * Fetch items by location
 */
export async function fetchItemsByLocation(
  userId: UUID,
  location: 'fridge' | 'freezer' | 'pantry'
): Promise<ServiceResponse<InventoryItem[]>> {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('user_id', userId)
      .eq('location', location)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching items by location:', error);
      return { data: null, error: handleError(error) };
    }

    return { data: data as InventoryItem[], error: null };
  } catch (error) {
    console.error('Unexpected error fetching items by location:', error);
    return { data: null, error: handleError(error) };
  }
}

/**
 * Search inventory items by name or category
 */
export async function searchInventoryItems(
  userId: UUID,
  searchTerm: string
): Promise<ServiceResponse<InventoryItem[]>> {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('user_id', userId)
      .or(`name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error searching inventory items:', error);
      return { data: null, error: handleError(error) };
    }

    return { data: data as InventoryItem[], error: null };
  } catch (error) {
    console.error('Unexpected error searching inventory items:', error);
    return { data: null, error: handleError(error) };
  }
}

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

/**
 * Create a new inventory item
 */
export async function createInventoryItem(
  item: InventoryItemInput
): Promise<ServiceResponse<InventoryItem>> {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert([item])
      .select()
      .single();

    if (error) {
      console.error('Error creating inventory item:', error);
      return { data: null, error: handleError(error) };
    }

    return { data: data as InventoryItem, error: null };
  } catch (error) {
    console.error('Unexpected error creating inventory item:', error);
    return { data: null, error: handleError(error) };
  }
}

/**
 * Bulk create inventory items
 */
export async function createInventoryItemsBulk(
  items: InventoryItemInput[]
): Promise<ServiceResponse<InventoryItem[]>> {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert(items)
      .select();

    if (error) {
      console.error('Error creating inventory items in bulk:', error);
      return { data: null, error: handleError(error) };
    }

    return { data: data as InventoryItem[], error: null };
  } catch (error) {
    console.error('Unexpected error creating inventory items in bulk:', error);
    return { data: null, error: handleError(error) };
  }
}

// ============================================================================
// UPDATE OPERATIONS
// ============================================================================

/**
 * Update an inventory item
 */
export async function updateInventoryItem(
  itemId: UUID,
  updates: InventoryItemUpdate
): Promise<ServiceResponse<InventoryItem>> {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      console.error('Error updating inventory item:', error);
      return { data: null, error: handleError(error) };
    }

    return { data: data as InventoryItem, error: null };
  } catch (error) {
    console.error('Unexpected error updating inventory item:', error);
    return { data: null, error: handleError(error) };
  }
}

/**
 * Update quantity of an inventory item
 */
export async function updateItemQuantity(
  itemId: UUID,
  quantity: number
): Promise<ServiceResponse<InventoryItem>> {
  return updateInventoryItem(itemId, { quantity });
}

/**
 * Move item to a different location
 */
export async function moveItemToLocation(
  itemId: UUID,
  location: 'fridge' | 'freezer' | 'pantry'
): Promise<ServiceResponse<InventoryItem>> {
  return updateInventoryItem(itemId, { location });
}

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Delete an inventory item
 */
export async function deleteInventoryItem(
  itemId: UUID
): Promise<ServiceResponse<void>> {
  try {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error deleting inventory item:', error);
      return { data: null, error: handleError(error) };
    }

    return { data: null, error: null };
  } catch (error) {
    console.error('Unexpected error deleting inventory item:', error);
    return { data: null, error: handleError(error) };
  }
}

/**
 * Delete all expired items for a user
 */
export async function deleteExpiredItems(
  userId: UUID
): Promise<ServiceResponse<{ count: number }>> {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('user_id', userId)
      .not('expiry_date', 'is', null)
      .lt('expiry_date', now)
      .select('id');

    if (error) {
      console.error('Error deleting expired items:', error);
      return { data: null, error: handleError(error) };
    }

    return { data: { count: data?.length || 0 }, error: null };
  } catch (error) {
    console.error('Unexpected error deleting expired items:', error);
    return { data: null, error: handleError(error) };
  }
}

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Get inventory statistics for a user
 */
export async function getInventoryStats(userId: UUID): Promise<
  ServiceResponse<{
    total: number;
    byLocation: Record<string, number>;
    expiringCount: number;
  }>
> {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('location, expiry_date')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching inventory stats:', error);
      return { data: null, error: handleError(error) };
    }

    const items = data as Array<{
      location: string;
      expiry_date: string | null;
    }>;

    const total = items.length;
    const byLocation: Record<string, number> = {};
    let expiringCount = 0;

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);

    items.forEach((item) => {
      // Count by location
      byLocation[item.location] = (byLocation[item.location] || 0) + 1;

      // Count expiring items
      if (item.expiry_date) {
        const expiryDate = new Date(item.expiry_date);
        if (expiryDate <= targetDate && expiryDate >= new Date()) {
          expiringCount++;
        }
      }
    });

    return {
      data: { total, byLocation, expiringCount },
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error fetching inventory stats:', error);
    return { data: null, error: handleError(error) };
  }
}

// ============================================================================
// BARCODE OPERATIONS
// ============================================================================

/**
 * Find inventory item by barcode
 */
export async function findItemByBarcode(
  userId: UUID,
  barcode: string
): Promise<ServiceResponse<InventoryItem>> {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('user_id', userId)
      .eq('barcode', barcode)
      .single();

    if (error) {
      // Item not found is expected, so don't log error
      if (error.code === 'PGRST116') {
        return { data: null, error: 'Item not found' };
      }
      console.error('Error finding item by barcode:', error);
      return { data: null, error: handleError(error) };
    }

    return { data: data as InventoryItem, error: null };
  } catch (error) {
    console.error('Unexpected error finding item by barcode:', error);
    return { data: null, error: handleError(error) };
  }
}
