/**
 * Date Utilities
 *
 * Provides consistent date formatting and calculations
 * Uses date-fns for reliable date operations
 */

import {
  format,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  subDays,
  startOfMonth,
  endOfMonth,
  isAfter,
  isBefore,
  isToday,
  isTomorrow,
  isYesterday,
  parseISO,
} from 'date-fns';
import { DATE_FORMATS, EXPIRY_WARNING_DAYS } from './constants';
import type { ExpiryStatus } from './constants';

// ============================================================================
// TYPES
// ============================================================================

export type DateFormatType = 'full' | 'short' | 'medium' | 'time' | 'datetime';

// ============================================================================
// DATE FORMATTING
// ============================================================================

/**
 * Format a date as a human-readable string
 *
 * @example
 * formatDate(new Date(), 'full') // "Monday, January 15, 2026"
 * formatDate(new Date(), 'short') // "Jan 15, 2026"
 * formatDate(new Date(), 'medium') // "Jan 15"
 * formatDate(new Date(), 'time') // "2:30 PM"
 * formatDate(new Date(), 'datetime') // "Jan 15, 2026 2:30 PM"
 * formatDate('2026-01-15', 'short') // "Jan 15, 2026"
 */
export function formatDate(
  date: Date | string,
  formatType: DateFormatType = 'short'
): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    // Validate date
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }

    const formatString = DATE_FORMATS[formatType.toUpperCase() as keyof typeof DATE_FORMATS];
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
}

// ============================================================================
// RELATIVE TIME
// ============================================================================

/**
 * Get relative time description (e.g., "2 days ago", "in 3 hours")
 *
 * @example
 * getRelativeTime(subDays(new Date(), 2)) // "2 days ago"
 * getRelativeTime(new Date()) // "just now"
 * getRelativeTime(addDays(new Date(), 3)) // "in 3 days"
 */
export function getRelativeTime(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();

    // Validate date
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }

    // Check for special cases
    if (isToday(dateObj)) {
      const minutesDiff = differenceInMinutes(now, dateObj);
      const hoursDiff = differenceInHours(now, dateObj);

      if (minutesDiff < 1) {
        return 'just now';
      } else if (minutesDiff < 60) {
        return `${minutesDiff} ${minutesDiff === 1 ? 'minute' : 'minutes'} ago`;
      } else {
        return `${hoursDiff} ${hoursDiff === 1 ? 'hour' : 'hours'} ago`;
      }
    }

    if (isYesterday(dateObj)) {
      return 'yesterday';
    }

    if (isTomorrow(dateObj)) {
      return 'tomorrow';
    }

    // Calculate days difference
    const daysDiff = differenceInDays(now, dateObj);

    // Past dates
    if (daysDiff > 0) {
      if (daysDiff < 7) {
        return `${daysDiff} ${daysDiff === 1 ? 'day' : 'days'} ago`;
      } else if (daysDiff < 30) {
        const weeks = Math.floor(daysDiff / 7);
        return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
      } else if (daysDiff < 365) {
        const months = Math.floor(daysDiff / 30);
        return `${months} ${months === 1 ? 'month' : 'months'} ago`;
      } else {
        const years = Math.floor(daysDiff / 365);
        return `${years} ${years === 1 ? 'year' : 'years'} ago`;
      }
    }

    // Future dates
    const absDaysDiff = Math.abs(daysDiff);
    if (absDaysDiff < 7) {
      return `in ${absDaysDiff} ${absDaysDiff === 1 ? 'day' : 'days'}`;
    } else if (absDaysDiff < 30) {
      const weeks = Math.floor(absDaysDiff / 7);
      return `in ${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
    } else if (absDaysDiff < 365) {
      const months = Math.floor(absDaysDiff / 30);
      return `in ${months} ${months === 1 ? 'month' : 'months'}`;
    } else {
      const years = Math.floor(absDaysDiff / 365);
      return `in ${years} ${years === 1 ? 'year' : 'years'}`;
    }
  } catch (error) {
    console.error('Relative time error:', error);
    return 'Invalid date';
  }
}

// ============================================================================
// EXPIRY STATUS
// ============================================================================

/**
 * Get expiry status for a date
 *
 * @example
 * getExpiryStatus(subDays(new Date(), 1)) // "expired"
 * getExpiryStatus(new Date()) // "expires-today"
 * getExpiryStatus(addDays(new Date(), 2)) // "expires-soon" (within 7 days)
 * getExpiryStatus(addDays(new Date(), 10)) // "fresh"
 */
export function getExpiryStatus(expiryDate: Date | string): ExpiryStatus {
  try {
    const dateObj = typeof expiryDate === 'string' ? parseISO(expiryDate) : expiryDate;
    const now = new Date();

    // Validate date
    if (isNaN(dateObj.getTime())) {
      return 'fresh';
    }

    // Check if expired (before today)
    if (isBefore(dateObj, now) && !isToday(dateObj)) {
      return 'expired';
    }

    // Check if expires today
    if (isToday(dateObj)) {
      return 'expires-today';
    }

    // Check if expires soon (within warning days)
    const daysUntil = differenceInDays(dateObj, now);
    if (daysUntil <= EXPIRY_WARNING_DAYS) {
      return 'expires-soon';
    }

    // Otherwise, fresh
    return 'fresh';
  } catch (error) {
    console.error('Expiry status error:', error);
    return 'fresh';
  }
}

/**
 * Get days until expiry (negative if expired)
 *
 * @example
 * getDaysUntilExpiry(addDays(new Date(), 5)) // 5
 * getDaysUntilExpiry(subDays(new Date(), 2)) // -2
 * getDaysUntilExpiry(new Date()) // 0
 */
export function getDaysUntilExpiry(expiryDate: Date | string): number {
  try {
    const dateObj = typeof expiryDate === 'string' ? parseISO(expiryDate) : expiryDate;
    const now = new Date();

    // Validate date
    if (isNaN(dateObj.getTime())) {
      return 0;
    }

    return differenceInDays(dateObj, now);
  } catch (error) {
    console.error('Days until expiry error:', error);
    return 0;
  }
}

// ============================================================================
// DATE RANGE HELPERS
// ============================================================================

/**
 * Check if a date is within the last N days
 *
 * @example
 * isWithinLastDays(subDays(new Date(), 3), 7) // true
 * isWithinLastDays(subDays(new Date(), 10), 7) // false
 */
export function isWithinLastDays(date: Date | string, days: number): boolean {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    const cutoffDate = subDays(now, days);

    // Validate date
    if (isNaN(dateObj.getTime())) {
      return false;
    }

    return isAfter(dateObj, cutoffDate) && isBefore(dateObj, now);
  } catch (error) {
    console.error('Within last days error:', error);
    return false;
  }
}

/**
 * Get date range for current month
 *
 * @example
 * getCurrentMonthRange() // { start: Date(2026-01-01), end: Date(2026-01-31) }
 */
export function getCurrentMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: startOfMonth(now),
    end: endOfMonth(now),
  };
}

/**
 * Get date range for last N days
 *
 * @example
 * getLastNDaysRange(7) // { start: Date(7 days ago), end: Date(now) }
 */
export function getLastNDaysRange(days: number): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: subDays(now, days),
    end: now,
  };
}

// ============================================================================
// SAFE PARSING
// ============================================================================

/**
 * Parse ISO date string safely
 *
 * @example
 * parseDateSafe('2026-01-15') // Date object or null if invalid
 * parseDateSafe('invalid') // null
 * parseDateSafe(null) // null
 */
export function parseDateSafe(dateString: string | null | undefined): Date | null {
  if (!dateString) {
    return null;
  }

  try {
    const date = parseISO(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.error('Date parsing error:', error);
    return null;
  }
}

/**
 * Check if a date string is valid
 *
 * @example
 * isValidDate('2026-01-15') // true
 * isValidDate('invalid') // false
 * isValidDate(null) // false
 */
export function isValidDate(dateString: string | null | undefined): boolean {
  return parseDateSafe(dateString) !== null;
}

// ============================================================================
// ISO DATE HELPERS
// ============================================================================

/**
 * Convert date to ISO string (YYYY-MM-DD format)
 *
 * @example
 * toISODateString(new Date('2026-01-15')) // "2026-01-15"
 */
export function toISODateString(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    // Validate date
    if (isNaN(dateObj.getTime())) {
      return '';
    }

    return format(dateObj, DATE_FORMATS.ISO);
  } catch (error) {
    console.error('ISO date string error:', error);
    return '';
  }
}

/**
 * Get today's date in ISO format (YYYY-MM-DD)
 *
 * @example
 * getTodayISO() // "2026-01-18"
 */
export function getTodayISO(): string {
  return toISODateString(new Date());
}

// ============================================================================
// COMPARISON HELPERS
// ============================================================================

/**
 * Check if date1 is before date2
 *
 * @example
 * isBeforeDate('2026-01-15', '2026-01-20') // true
 */
export function isBeforeDate(date1: Date | string, date2: Date | string): boolean {
  try {
    const dateObj1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const dateObj2 = typeof date2 === 'string' ? parseISO(date2) : date2;

    // Validate dates
    if (isNaN(dateObj1.getTime()) || isNaN(dateObj2.getTime())) {
      return false;
    }

    return isBefore(dateObj1, dateObj2);
  } catch (error) {
    console.error('Date comparison error:', error);
    return false;
  }
}

/**
 * Check if date1 is after date2
 *
 * @example
 * isAfterDate('2026-01-20', '2026-01-15') // true
 */
export function isAfterDate(date1: Date | string, date2: Date | string): boolean {
  try {
    const dateObj1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const dateObj2 = typeof date2 === 'string' ? parseISO(date2) : date2;

    // Validate dates
    if (isNaN(dateObj1.getTime()) || isNaN(dateObj2.getTime())) {
      return false;
    }

    return isAfter(dateObj1, dateObj2);
  } catch (error) {
    console.error('Date comparison error:', error);
    return false;
  }
}
