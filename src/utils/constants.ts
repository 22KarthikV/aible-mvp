/**
 * Application Constants
 *
 * Centralized location for all app-wide constants,
 * categories, options, and configuration values
 */

// ============================================================================
// CURRENCY CONSTANTS
// ============================================================================

export const CURRENCIES = ['GBP', 'USD', 'EUR', 'CAD', 'AUD'] as const;
export type Currency = typeof CURRENCIES[number];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  GBP: '£',
  USD: '$',
  EUR: '€',
  CAD: 'CA$',
  AUD: 'A$',
};

export const CURRENCY_NAMES: Record<Currency, string> = {
  GBP: 'British Pound',
  USD: 'US Dollar',
  EUR: 'Euro',
  CAD: 'Canadian Dollar',
  AUD: 'Australian Dollar',
};

// ============================================================================
// FOOD CATEGORIES
// ============================================================================

export const FOOD_CATEGORIES = [
  'Fruits',
  'Vegetables',
  'Meat',
  'Dairy',
  'Grains',
  'Snacks',
  'Beverages',
  'Condiments',
  'Frozen',
  'Other',
] as const;

export type FoodCategory = typeof FOOD_CATEGORIES[number];

// ============================================================================
// STORAGE LOCATIONS
// ============================================================================

export const STORAGE_LOCATIONS = [
  'Fridge',
  'Freezer',
  'Pantry',
  'Counter',
] as const;

export type StorageLocation = typeof STORAGE_LOCATIONS[number];

export const STORAGE_ICONS: Record<StorageLocation, string> = {
  Fridge: '🧊',
  Freezer: '❄️',
  Pantry: '🗄️',
  Counter: '🍽️',
};

// ============================================================================
// EXPIRY STATUS
// ============================================================================

export const EXPIRY_STATUS = [
  'expired',
  'expires-today',
  'expires-soon',
  'fresh',
] as const;

export type ExpiryStatus = typeof EXPIRY_STATUS[number];

export const EXPIRY_COLORS: Record<
  ExpiryStatus,
  { bg: string; text: string; border: string }
> = {
  expired: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-300',
  },
  'expires-today': {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-300',
  },
  'expires-soon': {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-300',
  },
  fresh: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-300',
  },
};

// ============================================================================
// TRANSACTION SOURCES
// ============================================================================

export const TRANSACTION_SOURCES = ['scan', 'manual', 'import'] as const;
export type TransactionSource = typeof TRANSACTION_SOURCES[number];

// ============================================================================
// BUDGET SETTINGS
// ============================================================================

export const DEFAULT_BUDGET_LIMIT = 500; // in GBP
export const DEFAULT_BUDGET_CURRENCY: Currency = 'GBP';
export const DEFAULT_ALERT_THRESHOLD = 80; // percentage

// ============================================================================
// CACHE SETTINGS
// ============================================================================

export const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// DATE FORMATS
// ============================================================================

export const DATE_FORMATS = {
  FULL: 'EEEE, MMMM d, yyyy',
  SHORT: 'MMM d, yyyy',
  MEDIUM: 'MMM d',
  TIME: 'h:mm a',
  DATETIME: 'MMM d, yyyy h:mm a',
  ISO: 'yyyy-MM-dd',
} as const;

// ============================================================================
// API ENDPOINTS (if needed)
// ============================================================================

export const API_ENDPOINTS = {
  OPEN_FOOD_FACTS: 'https://world.openfoodfacts.org/api/v2',
  SPOONACULAR: 'https://api.spoonacular.com',
} as const;

// ============================================================================
// UI CONSTANTS
// ============================================================================

export const EXPIRY_WARNING_DAYS = 7; // Show warning if expires within 7 days
export const ITEMS_PER_PAGE = 20;
export const DEBOUNCE_DELAY_MS = 300;

// ============================================================================
// REGEX PATTERNS
// ============================================================================

export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  BARCODE_EAN13: /^\d{13}$/,
  BARCODE_UPC: /^\d{12}$/,
  POSITIVE_NUMBER: /^\d+(\.\d+)?$/,
} as const;
