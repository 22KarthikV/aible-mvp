# Utilities Documentation

This directory contains reusable utility functions for the Aible application.

## Overview

The utilities layer provides:

- **Currency & Number Formatting** - Consistent formatting across the app
- **Date Helpers** - Date parsing, formatting, and calculations
- **Constants** - Centralized application constants

## Files

### `formatters.ts`

Currency and number formatting utilities using the Intl API.

**Functions:**
- `formatCurrency(amount, options)` - Format currency with locale support
- `getCurrencySymbol(currency)` - Get currency symbol
- `formatNumber(value, locale)` - Format numbers with thousands separators
- `formatPercentage(value, decimals)` - Format percentages
- `formatCompactNumber(value, locale)` - Format compact numbers (1.2K, 3.4M)
- `formatFileSize(bytes, decimals)` - Format file sizes
- `formatDuration(milliseconds)` - Format time durations

**Example:**
```typescript
import { formatCurrency, formatPercentage } from '@/utils';

formatCurrency(1234.56, { currency: 'GBP' }); // "£1,234.56"
formatPercentage(0.8567, 2); // "85.67%"
```

### `dateHelpers.ts`

Date manipulation and formatting utilities using date-fns.

**Functions:**
- `formatDate(date, formatType)` - Format dates consistently
- `getRelativeTime(date)` - Get relative time descriptions
- `getExpiryStatus(expiryDate)` - Get expiry status for inventory
- `getDaysUntilExpiry(expiryDate)` - Calculate days until expiry
- `isWithinLastDays(date, days)` - Check if date is within last N days
- `getCurrentMonthRange()` - Get start/end of current month
- `parseDateSafe(dateString)` - Safely parse date strings
- `isValidDate(dateString)` - Validate date strings
- `toISODateString(date)` - Convert to ISO format (YYYY-MM-DD)
- `getTodayISO()` - Get today's date in ISO format

**Example:**
```typescript
import { formatDate, getRelativeTime, getExpiryStatus } from '@/utils';

formatDate(new Date(), 'short'); // "Jan 18, 2026"
getRelativeTime(subDays(new Date(), 2)); // "2 days ago"
getExpiryStatus(addDays(new Date(), 2)); // "expires-soon"
```

### `constants.ts`

Application-wide constants, types, and configuration values.

**Exports:**
- `CURRENCIES` - Supported currency codes
- `CURRENCY_SYMBOLS` - Currency symbol mappings
- `FOOD_CATEGORIES` - Food category options
- `STORAGE_LOCATIONS` - Inventory storage locations
- `STORAGE_ICONS` - Icons for storage locations
- `EXPIRY_STATUS` - Expiry status types
- `EXPIRY_COLORS` - Tailwind classes for expiry status
- `DATE_FORMATS` - Date format strings for date-fns
- `EXPIRY_WARNING_DAYS` - Days before expiry to show warning (7)
- `PATTERNS` - Regex patterns for validation

**Example:**
```typescript
import { CURRENCY_SYMBOLS, EXPIRY_WARNING_DAYS, EXPIRY_COLORS } from '@/utils';

const symbol = CURRENCY_SYMBOLS['GBP']; // "£"
const warningDays = EXPIRY_WARNING_DAYS; // 7
const colors = EXPIRY_COLORS['expired']; // { bg: 'bg-red-100', ... }
```

### `index.ts`

Barrel export file for convenient imports.

**Example:**
```typescript
// Import everything from one place
import {
  formatCurrency,
  formatDate,
  CURRENCY_SYMBOLS,
  getExpiryStatus
} from '@/utils';
```

## Usage Guidelines

### Importing Utilities

```typescript
// Import specific utilities
import { formatCurrency, formatDate } from '@/utils';

// Or import from specific files
import { formatCurrency } from '@/utils/formatters';
import { formatDate } from '@/utils/dateHelpers';
import { CURRENCIES } from '@/utils/constants';
```

### Error Handling

All utility functions include comprehensive error handling:

- **Invalid inputs** - Return safe default values
- **Null/undefined** - Handle gracefully without throwing
- **Invalid dates** - Return "Invalid date" or null
- **Invalid numbers** - Return "0" or safe defaults

### Type Safety

All utilities are fully typed with TypeScript:

```typescript
import type { Currency, ExpiryStatus } from '@/utils';

const currency: Currency = 'GBP'; // Type-safe
const status: ExpiryStatus = 'expired'; // Type-safe
```

## Migration Notes

These utilities replace logic previously scattered throughout components:

- **Currency formatting** - Previously in FinancialInsights.tsx
- **Date calculations** - Previously in Profile.tsx and InventoryItemCard.tsx
- **Constants** - Previously in inventorySchemas.ts

Existing code will be updated in future tasks to use these utilities.

## Testing

All utilities are designed to be pure functions for easy testing:

```typescript
import { formatCurrency, getDaysUntilExpiry } from '@/utils';

// Easy to test
expect(formatCurrency(100, { currency: 'GBP' })).toBe('£100.00');
expect(getDaysUntilExpiry(tomorrow)).toBe(1);
```

## Performance

- **Memoization** - Functions use efficient algorithms
- **Intl API** - Browser-native internationalization
- **date-fns** - Tree-shakeable, modern date library
- **No dependencies** - Minimal bundle impact

## Future Enhancements

Potential additions:

- Validation helpers
- String manipulation utilities
- Array/object helpers
- Debounce/throttle functions
- Local storage helpers
- API response transformers
