/**
 * Compilation Test for Utils
 *
 * This file imports and uses all utility functions to verify they compile correctly
 */

import {
  // Formatters
  formatCurrency,
  getCurrencySymbol,
  formatNumber,
  formatPercentage,
  formatCompactNumber,
  formatFileSize,
  formatDuration,

  // Date Helpers
  formatDate,
  getRelativeTime,
  getExpiryStatus,
  getDaysUntilExpiry,
  isWithinLastDays,
  getCurrentMonthRange,
  getLastNDaysRange,
  parseDateSafe,
  isValidDate,
  toISODateString,
  getTodayISO,
  isBeforeDate,
  isAfterDate,

  // Constants
  CURRENCIES,
  CURRENCY_SYMBOLS,
  CURRENCY_NAMES,
  FOOD_CATEGORIES,
  STORAGE_LOCATIONS,
  STORAGE_ICONS,
  EXPIRY_STATUS,
  EXPIRY_COLORS,
  TRANSACTION_SOURCES,
  DEFAULT_BUDGET_LIMIT,
  DEFAULT_BUDGET_CURRENCY,
  DEFAULT_ALERT_THRESHOLD,
  CACHE_DURATION_MS,
  DATE_FORMATS,
  API_ENDPOINTS,
  EXPIRY_WARNING_DAYS,
  ITEMS_PER_PAGE,
  DEBOUNCE_DELAY_MS,
  PATTERNS,

  // Types
  type Currency,
  type FoodCategory,
  type StorageLocation,
  type ExpiryStatus,
  type TransactionSource,
  type FormatCurrencyOptions,
  type DateFormatType,
} from './src/utils';

// ============================================================================
// TEST FORMATTERS
// ============================================================================

// Currency formatting
const formattedCurrency = formatCurrency(1234.56, { currency: 'GBP' });
const usdCurrency = formatCurrency(1234.56, { currency: 'USD' });
const symbol = getCurrencySymbol('EUR');

// Number formatting
const formattedNumber = formatNumber(1234567);
const percentage = formatPercentage(0.8567);
const compactNumber = formatCompactNumber(1234567);
const fileSize = formatFileSize(1048576);
const duration = formatDuration(3665000);

// ============================================================================
// TEST DATE HELPERS
// ============================================================================

const now = new Date();

// Date formatting
const fullDate = formatDate(now, 'full');
const shortDate = formatDate(now, 'short');
const mediumDate = formatDate(now, 'medium');
const timeFormat = formatDate(now, 'time');
const datetime = formatDate(now, 'datetime');

// Relative time
const relativeTime = getRelativeTime(now);

// Expiry status
const expiryStatus = getExpiryStatus(now);
const daysUntil = getDaysUntilExpiry(now);

// Date range helpers
const isWithin = isWithinLastDays(now, 7);
const monthRange = getCurrentMonthRange();
const weekRange = getLastNDaysRange(7);

// Safe parsing
const parsedDate = parseDateSafe('2026-01-15');
const isValid = isValidDate('2026-01-15');
const isoString = toISODateString(now);
const todayISO = getTodayISO();

// Date comparisons
const isBefore = isBeforeDate('2026-01-15', '2026-01-20');
const isAfter = isAfterDate('2026-01-20', '2026-01-15');

// ============================================================================
// TEST CONSTANTS
// ============================================================================

// Currency constants
const currencies: readonly Currency[] = CURRENCIES;
const gbpSymbol = CURRENCY_SYMBOLS.GBP;
const usdName = CURRENCY_NAMES.USD;

// Food categories
const categories: readonly FoodCategory[] = FOOD_CATEGORIES;

// Storage locations
const locations: readonly StorageLocation[] = STORAGE_LOCATIONS;
const fridgeIcon = STORAGE_ICONS.Fridge;

// Expiry status
const statuses: readonly ExpiryStatus[] = EXPIRY_STATUS;
const expiredColors = EXPIRY_COLORS.expired;

// Transaction sources
const sources: readonly TransactionSource[] = TRANSACTION_SOURCES;

// Budget settings
const budgetLimit = DEFAULT_BUDGET_LIMIT;
const budgetCurrency = DEFAULT_BUDGET_CURRENCY;
const alertThreshold = DEFAULT_ALERT_THRESHOLD;

// Cache settings
const cacheDuration = CACHE_DURATION_MS;

// Date formats
const formats = DATE_FORMATS;

// API endpoints
const endpoints = API_ENDPOINTS;

// UI constants
const warningDays = EXPIRY_WARNING_DAYS;
const itemsPerPage = ITEMS_PER_PAGE;
const debounceDelay = DEBOUNCE_DELAY_MS;

// Regex patterns
const patterns = PATTERNS;

// ============================================================================
// TYPE TESTS
// ============================================================================

const currencyOptions: FormatCurrencyOptions = {
  currency: 'GBP',
  locale: 'en-GB',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

const dateFormatType: DateFormatType = 'full';

const currencyType: Currency = 'GBP';
const categoryType: FoodCategory = 'Fruits';
const locationTypes: StorageLocation = 'Fridge';
const statusType: ExpiryStatus = 'fresh';
const sourceType: TransactionSource = 'scan';

// ============================================================================
// EXPORT SUCCESS MESSAGE
// ============================================================================

console.log('All utilities compiled successfully!');
console.log('Formatters:', { formattedCurrency, symbol, formattedNumber, percentage });
console.log('Date Helpers:', { fullDate, relativeTime, expiryStatus, todayISO });
console.log('Constants:', { currencies, categories, locations });

export {};
