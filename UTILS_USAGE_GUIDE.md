# Utilities Usage Guide

Quick reference for using the utilities layer in your React components.

## Import Patterns

### Option 1: Barrel Import (Recommended)

```typescript
import { formatCurrency, formatDate, CURRENCIES } from "@/utils";
```

### Option 2: Direct Import

```typescript
import { formatCurrency } from "@/utils/formatters";
import { formatDate } from "@/utils/dateHelpers";
import { CURRENCIES } from "@/utils/constants";
```

## Common Use Cases

### 1. Displaying Currency in Components

**Before** (duplicated logic):

```typescript
const price = 1234.56;
const formatted = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
}).format(price);
```

**After** (using utils):

```typescript
import { formatCurrency } from "@/utils";

const price = 1234.56;
const formatted = formatCurrency(price, { currency: "GBP" });
```

### 2. Displaying Expiry Status

**Before** (duplicated logic):

```typescript
const getExpiryClass = (date: string) => {
  const days = differenceInDays(new Date(date), new Date());
  if (days < 0) return "text-red-500";
  if (days === 0) return "text-orange-500";
  if (days <= 7) return "text-yellow-500";
  return "text-green-500";
};
```

**After** (using utils):

```typescript
import { getExpiryStatus, EXPIRY_COLORS } from "@/utils";

const expiryStatus = getExpiryStatus(expiryDate);
const colors = EXPIRY_COLORS[expiryStatus];

// Use in JSX
<div className={`${colors.bg} ${colors.text} ${colors.border}`}>
  {expiryStatus}
</div>;
```

### 3. Formatting Dates Consistently

**Before** (inconsistent):

```typescript
const date1 = format(new Date(), "MMM d, yyyy");
const date2 = format(new Date(), "MMMM d, yyyy");
const date3 = new Date().toLocaleDateString();
```

**After** (consistent):

```typescript
import { formatDate } from "@/utils";

const date1 = formatDate(new Date(), "short"); // "Jan 18, 2026"
const date2 = formatDate(new Date(), "full"); // "Saturday, January 18, 2026"
const date3 = formatDate(new Date(), "datetime"); // "Jan 18, 2026 2:30 PM"
```

### 4. Using Constants in Forms

**Before** (hardcoded):

```typescript
const locations = ["Fridge", "Freezer", "Pantry", "Counter"];

<select>
  {locations.map((loc) => (
    <option key={loc} value={loc.toLowerCase()}>
      {loc}
    </option>
  ))}
</select>;
```

**After** (using constants):

```typescript
import { STORAGE_LOCATIONS, STORAGE_ICONS } from "@/utils";

<select>
  {STORAGE_LOCATIONS.map((location) => (
    <option key={location} value={location}>
      {STORAGE_ICONS[location]} {location}
    </option>
  ))}
</select>;
```

### 5. Displaying Relative Time

**Before** (manual calculation):

```typescript
const getTimeAgo = (date: string) => {
  const days = Math.floor(
    (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
  );
  return `${days} days ago`;
};
```

**After** (using utils):

```typescript
import { getRelativeTime } from "@/utils";

const timeAgo = getRelativeTime(purchaseDate);
// "2 days ago", "just now", "in 3 hours", etc.
```

### 6. Type-Safe Currency Selection

**Before** (string):

```typescript
const [currency, setCurrency] = useState("GBP");
```

**After** (type-safe):

```typescript
import type { Currency } from "@/utils";
import { CURRENCIES } from "@/utils";

const [currency, setCurrency] = useState<Currency>("GBP");

<select
  value={currency}
  onChange={(e) => setCurrency(e.target.value as Currency)}
>
  {CURRENCIES.map((curr) => (
    <option key={curr} value={curr}>
      {curr}
    </option>
  ))}
</select>;
```

## Component Examples

### Example 1: Inventory Item Card

```typescript
import {
  formatDate,
  getExpiryStatus,
  getDaysUntilExpiry,
  EXPIRY_COLORS,
  STORAGE_ICONS,
  type StorageLocation,
} from "@/utils";

interface InventoryItemCardProps {
  name: string;
  expiryDate: string;
  location: StorageLocation;
  purchaseDate: string;
}

export function InventoryItemCard({
  name,
  expiryDate,
  location,
  purchaseDate,
}: InventoryItemCardProps) {
  const expiryStatus = getExpiryStatus(expiryDate);
  const daysLeft = getDaysUntilExpiry(expiryDate);
  const colors = EXPIRY_COLORS[expiryStatus];

  return (
    <div className="card">
      <h3>{name}</h3>

      <div className="location">
        {STORAGE_ICONS[location]} {location}
      </div>

      <div className={`expiry ${colors.bg} ${colors.text} ${colors.border}`}>
        {expiryStatus === "expired"
          ? `Expired ${Math.abs(daysLeft)} days ago`
          : `Expires in ${daysLeft} days`}
      </div>

      <div className="date">Purchased: {formatDate(purchaseDate, "short")}</div>
    </div>
  );
}
```

### Example 2: Financial Dashboard

```typescript
import {
  formatCurrency,
  formatPercentage,
  getCurrentMonthRange,
  type Currency,
} from "@/utils";

interface FinancialDashboardProps {
  totalSpent: number;
  budgetLimit: number;
  currency: Currency;
}

export function FinancialDashboard({
  totalSpent,
  budgetLimit,
  currency,
}: FinancialDashboardProps) {
  const monthRange = getCurrentMonthRange();
  const spentPercentage = totalSpent / budgetLimit;

  return (
    <div className="dashboard">
      <h2>Budget Overview</h2>

      <div className="total">
        <span>Total Spent:</span>
        <span className="amount">
          {formatCurrency(totalSpent, { currency })}
        </span>
      </div>

      <div className="budget">
        <span>Budget:</span>
        <span>{formatCurrency(budgetLimit, { currency })}</span>
      </div>

      <div className="percentage">
        {formatPercentage(spentPercentage)} of budget used
      </div>

      <div className="period">
        Period: {formatDate(monthRange.start, "short")} -{" "}
        {formatDate(monthRange.end, "short")}
      </div>
    </div>
  );
}
```

### Example 3: Receipt Scanner

```typescript
import {
  formatCurrency,
  getTodayISO,
  parseDateSafe,
  type Currency,
  type TransactionSource,
} from "@/utils";

interface ScannedItem {
  name: string;
  price: number;
  quantity: number;
}

export function ReceiptReview() {
  const [items, setItems] = useState<ScannedItem[]>([]);
  const [currency] = useState<Currency>("GBP");
  const [source] = useState<TransactionSource>("scan");
  const [purchaseDate] = useState(getTodayISO());

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="receipt-review">
      <h2>Scanned Receipt</h2>

      <div className="metadata">
        <div>Date: {purchaseDate}</div>
        <div>Source: {source}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{formatCurrency(item.price, { currency })}</td>
              <td>
                {formatCurrency(item.price * item.quantity, { currency })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="total">Total: {formatCurrency(total, { currency })}</div>
    </div>
  );
}
```

## TypeScript Tips

### Use Exported Types

```typescript
import type {
  Currency,
  FoodCategory,
  StorageLocation,
  ExpiryStatus,
  TransactionSource,
  FormatCurrencyOptions,
  DateFormatType,
} from "@/utils";

// Type-safe state
const [currency, setCurrency] = useState<Currency>("GBP");
const [category, setCategory] = useState<FoodCategory>("Fruits");
const [location, setLocation] = useState<StorageLocation>("Fridge");
```

### Type Guards

```typescript
import { CURRENCIES, type Currency } from "@/utils";

function isCurrency(value: string): value is Currency {
  return CURRENCIES.includes(value as Currency);
}

const userInput = "GBP";
if (isCurrency(userInput)) {
  // TypeScript knows userInput is Currency here
  setCurrency(userInput);
}
```

## Performance Tips

### Memoize Formatted Values

```typescript
import { useMemo } from "react";
import { formatCurrency, getExpiryStatus } from "@/utils";

function ExpensiveComponent({ items, currency }) {
  const total = useMemo(
    () =>
      formatCurrency(
        items.reduce((sum, item) => sum + item.price, 0),
        { currency }
      ),
    [items, currency]
  );

  return <div>Total: {total}</div>;
}
```

### Cache Date Calculations

```typescript
import { useMemo } from "react";
import { getExpiryStatus, EXPIRY_COLORS } from "@/utils";

function InventoryItem({ expiryDate }) {
  const expiryInfo = useMemo(
    () => ({
      status: getExpiryStatus(expiryDate),
      get colors() {
        return EXPIRY_COLORS[this.status];
      },
    }),
    [expiryDate]
  );

  return <div className={expiryInfo.colors.bg}>{expiryInfo.status}</div>;
}
```

## Testing Components with Utils

```typescript
import { render, screen } from "@testing-library/react";
import { formatCurrency } from "@/utils";

describe("PriceDisplay", () => {
  it("displays formatted price", () => {
    const price = 1234.56;
    const expected = formatCurrency(price, { currency: "GBP" });

    render(<PriceDisplay amount={price} currency="GBP" />);

    expect(screen.getByText(expected)).toBeInTheDocument();
  });
});
```

## Common Patterns

### Safe Date Handling

```typescript
import { parseDateSafe, isValidDate, formatDate } from "@/utils";

function SafeDateDisplay({ dateString }: { dateString: string | null }) {
  if (!isValidDate(dateString)) {
    return <span>No date available</span>;
  }

  const date = parseDateSafe(dateString);
  return <span>{date && formatDate(date, "short")}</span>;
}
```

### Conditional Formatting

```typescript
import { formatCurrency, formatPercentage, type Currency } from "@/utils";

function ConditionalFormat({
  value,
  type,
  currency,
}: {
  value: number;
  type: "currency" | "percentage";
  currency?: Currency;
}) {
  if (type === "currency" && currency) {
    return <span>{formatCurrency(value, { currency })}</span>;
  }

  if (type === "percentage") {
    return <span>{formatPercentage(value)}</span>;
  }

  return <span>{value}</span>;
}
```

## Best Practices

1. **Always import from barrel export** (`@/utils`) for consistency
2. **Use TypeScript types** for type safety
3. **Memoize expensive calculations** with useMemo
4. **Handle null/undefined cases** before calling utilities
5. **Validate dates** with `isValidDate()` before parsing
6. **Use constants** instead of hardcoding values
7. **Leverage EXPIRY_COLORS** for consistent styling
8. **Format all dates** with `formatDate()` for consistency
9. **Format all currency** with `formatCurrency()` for consistency
10. **Test components** that use utilities with known inputs/outputs

---

**Ready to Use**: All utilities are production-ready and can be imported immediately into your components!
