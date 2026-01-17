/**
 * Inventory Validation Schemas
 *
 * Zod schemas for validating inventory forms with React Hook Form.
 * Provides type-safe validation with user-friendly error messages.
 */

import { z } from 'zod';

// ============================================================================
// BASE SCHEMAS
// ============================================================================

/**
 * Storage location schema with enum validation
 */
const storageLocationSchema = z.enum(['fridge', 'freezer', 'pantry'], {
  message: 'Please select a valid storage location',
});

/**
 * Category schema with common categories
 */
const categorySchema = z.string().min(1, 'Category is required').max(50);

/**
 * Unit of measurement schema
 */
const unitSchema = z.string().min(1, 'Unit is required').max(20);

/**
 * Future date schema for expiry dates
 */
const futureDateSchema = z
  .string()
  .optional()
  .nullable()
  .refine(
    (val) => {
      if (!val) return true; // Optional
      const date = new Date(val);
      return !isNaN(date.getTime());
    },
    { message: 'Invalid date format' }
  );

/**
 * Past or present date schema for purchase dates
 */
const pastDateSchema = z
  .string()
  .optional()
  .nullable()
  .refine(
    (val) => {
      if (!val) return true; // Optional
      const date = new Date(val);
      if (isNaN(date.getTime())) return false;
      return date <= new Date();
    },
    { message: 'Purchase date cannot be in the future' }
  );

// ============================================================================
// INVENTORY ITEM SCHEMAS
// ============================================================================

/**
 * Schema for creating a new inventory item
 */
export const createInventoryItemSchema = z.object({
  name: z
    .string()
    .min(1, 'Item name is required')
    .max(100, 'Item name must be less than 100 characters')
    .trim(),

  category: categorySchema,

  quantity: z
    .number({
      message: 'Quantity must be a valid number',
    })
    .positive('Quantity must be greater than 0')
    .max(10000, 'Quantity seems unreasonably high'),

  unit: unitSchema,

  expiry_date: futureDateSchema,

  purchase_date: pastDateSchema,

  location: storageLocationSchema,

  barcode: z
    .string()
    .max(50, 'Barcode must be less than 50 characters')
    .optional()
    .nullable(),

  image_url: z.string().url('Invalid image URL').optional().nullable(),

  notes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional()
    .nullable(),
});

/**
 * Schema for updating an existing inventory item
 * All fields are optional for partial updates
 */
export const updateInventoryItemSchema = z.object({
  name: z
    .string()
    .min(1, 'Item name is required')
    .max(100, 'Item name must be less than 100 characters')
    .trim()
    .optional(),

  category: categorySchema.optional(),

  quantity: z
    .number({
      message: 'Quantity must be a valid number',
    })
    .positive('Quantity must be greater than 0')
    .max(10000, 'Quantity seems unreasonably high')
    .optional(),

  unit: unitSchema.optional(),

  expiry_date: futureDateSchema,

  purchase_date: pastDateSchema,

  location: storageLocationSchema.optional(),

  barcode: z
    .string()
    .max(50, 'Barcode must be less than 50 characters')
    .optional()
    .nullable(),

  image_url: z.string().url('Invalid image URL').optional().nullable(),

  notes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional()
    .nullable(),
});

/**
 * Quick add schema with minimal required fields
 */
export const quickAddInventoryItemSchema = z.object({
  name: z
    .string()
    .min(1, 'Item name is required')
    .max(100, 'Item name must be less than 100 characters')
    .trim(),

  quantity: z
    .number({
      message: 'Quantity must be a valid number',
    })
    .positive('Quantity must be greater than 0')
    .max(10000, 'Quantity seems unreasonably high'),

  unit: unitSchema,

  location: storageLocationSchema,
});

/**
 * Barcode scan result schema
 */
export const barcodeScanSchema = z.object({
  barcode: z
    .string()
    .min(1, 'Barcode is required')
    .max(50, 'Barcode must be less than 50 characters'),

  name: z.string().optional(),
  category: z.string().optional(),
  image_url: z.string().url().optional(),
});

// ============================================================================
// FORM INPUT TYPES
// ============================================================================

/**
 * TypeScript type inferred from create schema
 */
export type CreateInventoryItemFormData = z.infer<
  typeof createInventoryItemSchema
>;

/**
 * TypeScript type inferred from update schema
 */
export type UpdateInventoryItemFormData = z.infer<
  typeof updateInventoryItemSchema
>;

/**
 * TypeScript type inferred from quick add schema
 */
export type QuickAddInventoryItemFormData = z.infer<
  typeof quickAddInventoryItemSchema
>;

/**
 * TypeScript type inferred from barcode scan schema
 */
export type BarcodeScanFormData = z.infer<typeof barcodeScanSchema>;

// ============================================================================
// COMMON CATEGORY OPTIONS
// ============================================================================

/**
 * Predefined category options for dropdowns
 */
export const CATEGORY_OPTIONS = [
  { value: 'fruits', label: 'Fruits' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'meat', label: 'Meat' },
  { value: 'seafood', label: 'Seafood' },
  { value: 'grains', label: 'Grains' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'condiments', label: 'Condiments' },
  { value: 'spices', label: 'Spices' },
  { value: 'canned', label: 'Canned Goods' },
  { value: 'frozen', label: 'Frozen Foods' },
  { value: 'other', label: 'Other' },
] as const;

/**
 * Predefined unit options for dropdowns
 */
export const UNIT_OPTIONS = [
  { value: 'piece', label: 'Piece(s)' },
  { value: 'kg', label: 'Kilogram(s)' },
  { value: 'g', label: 'Gram(s)' },
  { value: 'lb', label: 'Pound(s)' },
  { value: 'oz', label: 'Ounce(s)' },
  { value: 'L', label: 'Liter(s)' },
  { value: 'mL', label: 'Milliliter(s)' },
  { value: 'cup', label: 'Cup(s)' },
  { value: 'tbsp', label: 'Tablespoon(s)' },
  { value: 'tsp', label: 'Teaspoon(s)' },
  { value: 'box', label: 'Box(es)' },
  { value: 'can', label: 'Can(s)' },
  { value: 'jar', label: 'Jar(s)' },
  { value: 'bottle', label: 'Bottle(s)' },
  { value: 'pack', label: 'Pack(s)' },
] as const;

/**
 * Storage location options for dropdowns
 */
export const LOCATION_OPTIONS = [
  { value: 'fridge', label: 'Fridge', icon: '❄️' },
  { value: 'freezer', label: 'Freezer', icon: '🧊' },
  { value: 'pantry', label: 'Pantry', icon: '🏠' },
] as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get category label from value
 */
export function getCategoryLabel(value: string): string {
  const category = CATEGORY_OPTIONS.find((cat) => cat.value === value);
  return category?.label || value;
}

/**
 * Get unit label from value
 */
export function getUnitLabel(value: string): string {
  const unit = UNIT_OPTIONS.find((u) => u.value === value);
  return unit?.label || value;
}

/**
 * Get location label from value
 */
export function getLocationLabel(
  value: 'fridge' | 'freezer' | 'pantry'
): string {
  const location = LOCATION_OPTIONS.find((loc) => loc.value === value);
  return location?.label || value;
}

/**
 * Get location icon from value
 */
export function getLocationIcon(
  value: 'fridge' | 'freezer' | 'pantry'
): string {
  const location = LOCATION_OPTIONS.find((loc) => loc.value === value);
  return location?.icon || '📦';
}
