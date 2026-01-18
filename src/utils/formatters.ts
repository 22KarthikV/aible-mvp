/**
 * Currency and Number Formatting Utilities
 *
 * Provides consistent formatting across the application
 * using the Intl API for internationalization support
 */

import type { Currency } from './constants';
import { CURRENCY_SYMBOLS } from './constants';

// ============================================================================
// TYPES
// ============================================================================

export interface FormatCurrencyOptions {
  currency: Currency;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

// ============================================================================
// CURRENCY FORMATTING
// ============================================================================

/**
 * Format a number as currency with locale support
 *
 * @example
 * formatCurrency(1234.56, { currency: 'GBP' }) // "£1,234.56"
 * formatCurrency(1234.56, { currency: 'USD' }) // "$1,234.56"
 * formatCurrency(1234.56, { currency: 'EUR', locale: 'de-DE' }) // "1.234,56 €"
 */
export function formatCurrency(
  amount: number,
  options: FormatCurrencyOptions
): string {
  // Handle edge cases
  if (!Number.isFinite(amount)) {
    return `${getCurrencySymbol(options.currency)}0.00`;
  }

  const {
    currency,
    locale = 'en-GB',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options;

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits,
      maximumFractionDigits,
    });

    return formatter.format(amount);
  } catch (error) {
    // Fallback to manual formatting if Intl fails
    console.error('Currency formatting error:', error);
    const symbol = getCurrencySymbol(currency);
    const formatted = amount.toFixed(maximumFractionDigits);
    return `${symbol}${formatted}`;
  }
}

/**
 * Get currency symbol for a given currency code
 *
 * @example
 * getCurrencySymbol('GBP') // "£"
 * getCurrencySymbol('USD') // "$"
 * getCurrencySymbol('EUR') // "€"
 */
export function getCurrencySymbol(currency: Currency): string {
  return CURRENCY_SYMBOLS[currency] || currency;
}

// ============================================================================
// NUMBER FORMATTING
// ============================================================================

/**
 * Format a number with thousands separators
 *
 * @example
 * formatNumber(1234567) // "1,234,567"
 * formatNumber(1234567.89) // "1,234,567.89"
 * formatNumber(1234567, 'de-DE') // "1.234.567"
 */
export function formatNumber(value: number, locale: string = 'en-GB'): string {
  // Handle edge cases
  if (!Number.isFinite(value)) {
    return '0';
  }

  try {
    const formatter = new Intl.NumberFormat(locale);
    return formatter.format(value);
  } catch (error) {
    console.error('Number formatting error:', error);
    return value.toString();
  }
}

/**
 * Format a percentage value
 *
 * @example
 * formatPercentage(0.8567) // "85.67%"
 * formatPercentage(0.8567, 1) // "85.7%"
 * formatPercentage(0.8567, 0) // "86%"
 */
export function formatPercentage(
  value: number,
  decimals: number = 2
): string {
  // Handle edge cases
  if (!Number.isFinite(value)) {
    return '0%';
  }

  // Convert to percentage (multiply by 100)
  const percentage = value * 100;

  // Round to specified decimals
  const rounded = Number(percentage.toFixed(decimals));

  // Format with decimals
  return `${rounded.toFixed(decimals)}%`;
}

/**
 * Format a compact number (e.g., 1.2K, 3.4M)
 *
 * @example
 * formatCompactNumber(1234) // "1.2K"
 * formatCompactNumber(1234567) // "1.2M"
 * formatCompactNumber(1234567890) // "1.2B"
 */
export function formatCompactNumber(
  value: number,
  locale: string = 'en-GB'
): string {
  // Handle edge cases
  if (!Number.isFinite(value)) {
    return '0';
  }

  try {
    // Try using Intl.NumberFormat with compact notation (modern browsers)
    const formatter = new Intl.NumberFormat(locale, {
      notation: 'compact',
      compactDisplay: 'short',
    });
    return formatter.format(value);
  } catch {
    // Fallback for older browsers
    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (absValue >= 1e9) {
      return `${sign}${(absValue / 1e9).toFixed(1)}B`;
    } else if (absValue >= 1e6) {
      return `${sign}${(absValue / 1e6).toFixed(1)}M`;
    } else if (absValue >= 1e3) {
      return `${sign}${(absValue / 1e3).toFixed(1)}K`;
    } else {
      return `${sign}${absValue}`;
    }
  }
}

/**
 * Format file size in human-readable format
 *
 * @example
 * formatFileSize(1024) // "1.00 KB"
 * formatFileSize(1048576) // "1.00 MB"
 * formatFileSize(1073741824) // "1.00 GB"
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  // Handle edge cases
  if (!Number.isFinite(bytes) || bytes < 0) {
    return '0 Bytes';
  }

  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${
    sizes[i]
  }`;
}

/**
 * Format a duration in milliseconds to human-readable format
 *
 * @example
 * formatDuration(1000) // "1s"
 * formatDuration(65000) // "1m 5s"
 * formatDuration(3665000) // "1h 1m 5s"
 */
export function formatDuration(milliseconds: number): string {
  // Handle edge cases
  if (!Number.isFinite(milliseconds) || milliseconds < 0) {
    return '0s';
  }

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  } else if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  } else if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  } else {
    return `${seconds}s`;
  }
}
