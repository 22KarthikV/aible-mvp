# Custom Hooks Documentation

This document provides comprehensive documentation for all custom React hooks in the Aible application, located in `src/hooks/`.

## Overview

The custom hooks layer reduces component complexity and improves code reuse across the application by extracting common patterns into reusable, composable hooks.

## Table of Contents

1. [useAsync](#useasync) - Generic async state management
2. [useDebounce](#usedebounce) - Value debouncing
3. [useInventory](#useinventory) - Inventory management
4. [useFinance](#usefinance) - Financial insights
5. [usePagination](#usepagination) - Client-side pagination
6. [Migration Examples](#migration-examples)

---

## useAsync

**Purpose**: Generic hook for managing async operations with automatic loading, error, and data state handling.

### Features

- Automatic loading/error/data state management
- Optional immediate execution on mount
- Retry logic with configurable attempts and delay
- Cleanup on unmount (prevents memory leaks)
- Success/error callbacks

### API

```typescript
function useAsync<T, Args extends any[]>(
  asyncFunction: (...args: Args) => Promise<T>,
  options?: {
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    retry?: number;
    retryDelay?: number;
  }
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: Args) => Promise<void>;
  reset: () => void;
}
```

### Example Usage

```typescript
import { useAsync } from '../hooks';

// Basic usage with manual execution
const { data, loading, error, execute } = useAsync(fetchUserData);

// Execute manually
await execute(userId);

// With immediate execution and callbacks
const { data, loading, error } = useAsync(
  fetchInventoryItems,
  {
    immediate: true,
    onSuccess: (items) => console.log('Loaded', items.length, 'items'),
    onError: (error) => console.error('Failed to load:', error.message),
    retry: 3,
    retryDelay: 1000
  }
);

// Reset state
reset();
```

---

## useDebounce

**Purpose**: Debounce a value with configurable delay. Useful for search inputs and form validation.

### API

```typescript
function useDebounce<T>(value: T, delay?: number): T
```

### Example Usage

```typescript
import { useDebounce } from '../hooks';
import { useEffect, useState } from 'react';

function SearchComponent() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Only run search after user stops typing for 300ms
  useEffect(() => {
    if (debouncedSearch) {
      performSearch(debouncedSearch);
    }
  }, [debouncedSearch]);

  return (
    <input
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

---

## useInventory

**Purpose**: Comprehensive hook for managing inventory data with filtering and CRUD operations.

### Features

- Automatic data fetching on mount
- Real-time filtering (search + category + location + expiry)
- Computed statistics (total, expired, expiring soon)
- CRUD operations (add, update, delete)
- Filter management

### API

```typescript
function useInventory(userId: string): {
  // Data state
  items: InventoryItemWithStatus[];
  filteredItems: InventoryItemWithStatus[];
  loading: boolean;
  error: string | null;

  // Filter state
  filters: {
    searchQuery: string;
    selectedCategory: string | null;
    selectedLocation: StorageLocation | null;
    showExpiredOnly: boolean;
    showExpiringSoon: boolean;
  };

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
```

### Example Usage

```typescript
import { useInventory } from '../hooks';

function InventoryPage() {
  const { user } = useAuth();
  const {
    filteredItems,
    loading,
    error,
    totalItems,
    expiredCount,
    filters,
    setFilters,
    addItem,
    deleteItem
  } = useInventory(user.id);

  // Update search filter
  const handleSearch = (query: string) => {
    setFilters({ searchQuery: query });
  };

  // Add new item
  const handleAdd = async (itemData) => {
    try {
      await addItem(itemData);
      console.log('Item added successfully');
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <Stats total={totalItems} expired={expiredCount} />
      <SearchBar value={filters.searchQuery} onChange={handleSearch} />
      <ItemList items={filteredItems} onDelete={deleteItem} />
    </div>
  );
}
```

---

## useFinance

**Purpose**: Hook for managing financial data including budget and transactions.

### Features

- Budget management (fetch, update)
- Transaction management (add, update)
- Automatic caching (via transaction store)
- Computed values (monthly spending, budget usage, top categories)
- Recent transactions

### API

```typescript
function useFinance(userId: string): {
  // Budget state
  budget: UserBudget | null;
  budgetLoading: boolean;
  budgetError: string | null;

  // Transaction state
  transactions: Transaction[];
  transactionsLoading: boolean;
  transactionsError: string | null;

  // Computed values
  monthlySpending: number;
  budgetUsagePercentage: number;
  budgetRemaining: number;
  topCategories: { category: string; amount: number }[];
  recentTransactions: Transaction[];

  // Actions
  updateBudget: (updates: Partial<UserBudget>) => Promise<void>;
  addTransaction: (transaction: TransactionInput) => Promise<void>;
  updateTransactionById: (id: string, updates: Partial<TransactionInput>) => Promise<void>;
  refreshData: () => Promise<void>;
}
```

### Example Usage

```typescript
import { useFinance } from '../hooks';

function FinancialDashboard() {
  const { user } = useAuth();
  const {
    budget,
    budgetLoading,
    monthlySpending,
    budgetUsagePercentage,
    budgetRemaining,
    topCategories,
    recentTransactions,
    updateBudget,
    addTransaction
  } = useFinance(user.id);

  // Update budget
  const handleUpdateBudget = async (newLimit: number) => {
    try {
      await updateBudget({ monthly_limit: newLimit });
      console.log('Budget updated successfully');
    } catch (error) {
      console.error('Failed to update budget:', error);
    }
  };

  if (budgetLoading) return <LoadingSpinner />;

  return (
    <div>
      <BudgetCard
        spent={monthlySpending}
        limit={budget?.monthly_limit || 0}
        percentage={budgetUsagePercentage}
        remaining={budgetRemaining}
      />
      <TopCategories categories={topCategories} />
      <RecentTransactions transactions={recentTransactions} />
    </div>
  );
}
```

---

## usePagination

**Purpose**: Client-side pagination for long lists.

### Features

- Automatic page calculation
- Navigation methods (next, prev, go to page)
- Configurable items per page
- Computed metadata (total pages, has next/prev)

### API

```typescript
function usePagination<T>(
  items: T[],
  initialItemsPerPage?: number
): {
  currentPage: number;
  itemsPerPage: number;
  paginatedItems: T[];
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  startIndex: number;
  endIndex: number;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;
}
```

### Example Usage

```typescript
import { usePagination } from '../hooks';

function ItemList({ items }: { items: Item[] }) {
  const {
    paginatedItems,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    goToPage
  } = usePagination(items, 20);

  return (
    <div>
      <div className="items">
        {paginatedItems.map(item => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>

      <div className="pagination">
        <button onClick={prevPage} disabled={!hasPrevPage}>
          Previous
        </button>

        <span>Page {currentPage} of {totalPages}</span>

        <button onClick={nextPage} disabled={!hasNextPage}>
          Next
        </button>
      </div>
    </div>
  );
}
```

---

## Migration Examples

### Before: Dashboard.tsx (Original)

```typescript
// OLD CODE - Without hooks
export default function Dashboard() {
  const { user } = useAuth();
  const { items, setItems, loading, setLoading, setError } = useInventoryStore();
  const { fetchUserTransactions, getShoppingTripsCount } = useTransactionStore();

  const shoppingTrips = getShoppingTripsCount(7);
  const inventoryCount = items.length;

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;

      if (items.length === 0 && !loading) {
        setLoading(true);
        try {
          const { data, error } = await fetchInventoryItems(user.id);
          if (error) {
            setError(error);
          } else if (data) {
            setItems(data);
          }
        } catch (err) {
          console.error('Failed to fetch inventory:', err);
          setError('Failed to load inventory data');
        } finally {
          setLoading(false);
        }
      }

      await fetchUserTransactions(user.id);
    };

    loadData();
  }, [user?.id, items.length, loading, setItems, setLoading, setError, fetchUserTransactions]);

  // ... rest of component
}
```

### After: Dashboard.tsx (With useInventory hook)

```typescript
// NEW CODE - With useInventory hook
export default function Dashboard() {
  const { user } = useAuth();
  const {
    totalItems: inventoryCount,
    loading: inventoryLoading
  } = useInventory(user.id);

  const { getShoppingTripsCount } = useTransactionStore();
  const shoppingTrips = getShoppingTripsCount(7);

  // That's it! All the data fetching and state management is handled by the hook

  // ... rest of component
}
```

**Lines of code reduced**: ~25 lines → 8 lines

---

### Before: FinancialInsights.tsx (Original)

```typescript
// OLD CODE - Without hooks
export default function FinancialInsights({ userId }: Props) {
  const { transactions, loading: txLoading, fetchUserTransactions } = useTransactionStore();
  const [budget, setBudget] = useState<UserBudget | null>(null);
  const [budgetLoading, setBudgetLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setBudgetLoading(true);
      const { data } = await fetchUserBudget(userId);
      if (data) {
        setBudget(data);
      }
      setBudgetLoading(false);
      await fetchUserTransactions(userId);
    }
    loadData();
  }, [userId, fetchUserTransactions]);

  // Manual calculations
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyTransactions = transactions.filter(t => {
    const d = new Date(t.transaction_date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const totalSpent = monthlyTransactions.reduce((sum, t) => sum + t.total_amount, 0);
  const budgetLimit = budget?.monthly_limit || 500;
  const percentageUsed = Math.min(100, Math.round((totalSpent / budgetLimit) * 100));
  const remaining = budgetLimit - totalSpent;

  // ... category breakdown calculations
}
```

### After: FinancialInsights.tsx (With useFinance hook)

```typescript
// NEW CODE - With useFinance hook
export default function FinancialInsights({ userId }: Props) {
  const {
    budget,
    budgetLoading,
    monthlySpending: totalSpent,
    budgetUsagePercentage: percentageUsed,
    budgetRemaining: remaining,
    topCategories,
    updateBudget,
    addTransaction
  } = useFinance(userId);

  // All data fetching, caching, and calculations handled by the hook!

  // ... rest of component
}
```

**Lines of code reduced**: ~40 lines → 12 lines

---

## Best Practices

### 1. Use hooks for complex async patterns

```typescript
// Good: Use useAsync for complex async operations
const { data, loading, error, execute } = useAsync(complexApiCall, {
  retry: 3,
  onError: (err) => showToast(err.message)
});

// Avoid: Manual state management for simple cases
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
// ... manual try/catch, cleanup, etc.
```

### 2. Combine hooks for powerful abstractions

```typescript
function SearchableInventory() {
  const { user } = useAuth();
  const {
    filteredItems,
    filters,
    setFilters,
    loading
  } = useInventory(user.id);

  // Debounce search to reduce unnecessary filtering
  const debouncedSearch = useDebounce(filters.searchQuery, 300);

  // Paginate results
  const {
    paginatedItems,
    currentPage,
    totalPages
  } = usePagination(filteredItems, 50);

  return (
    <div>
      <SearchInput
        value={filters.searchQuery}
        onChange={(q) => setFilters({ searchQuery: q })}
      />
      <ItemGrid items={paginatedItems} />
      <Pagination current={currentPage} total={totalPages} />
    </div>
  );
}
```

### 3. Handle errors gracefully

```typescript
const {
  data,
  loading,
  error,
  addItem
} = useInventory(user.id);

const handleAdd = async (itemData) => {
  try {
    await addItem(itemData);
    showSuccessToast('Item added!');
  } catch (error) {
    showErrorToast(error.message);
  }
};
```

### 4. Memoize expensive operations

All hooks use `useMemo` and `useCallback` internally for optimal performance. You don't need to wrap hook calls in additional memoization.

```typescript
// Good: Hooks are already optimized
const { filteredItems, totalItems } = useInventory(user.id);

// Avoid: Unnecessary additional memoization
const memoizedItems = useMemo(() => filteredItems, [filteredItems]); // Redundant!
```

---

## Performance Considerations

### Caching

- `useInventory`: Fetches data once per user session (unless manually refreshed)
- `useFinance`: Transaction store has 5-minute cache duration
- `useAsync`: No built-in caching (wrap in useMemo if needed)

### Re-renders

All hooks use React 19 best practices:
- Memoized selectors to prevent unnecessary re-renders
- Stable callback references via `useCallback`
- Computed values cached with `useMemo`

### Cleanup

All hooks properly clean up side effects:
- `useAsync`: Cancels pending requests on unmount
- `useDebounce`: Clears timeouts on unmount
- Other hooks: Follow React 19 cleanup patterns

---

## TypeScript Support

All hooks are fully typed with generics for maximum type safety:

```typescript
// Full type inference
const { data } = useAsync<User, [string]>(fetchUser);
//      ^? data: User | null

const { paginatedItems } = usePagination<InventoryItem>(items);
//      ^? paginatedItems: InventoryItem[]
```

---

## Testing

All hooks are designed to be easily testable:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useInventory } from '../hooks';

describe('useInventory', () => {
  it('should fetch inventory on mount', async () => {
    const { result } = renderHook(() => useInventory('user-123'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.items.length).toBeGreaterThan(0);
  });
});
```

---

## Contributing

When creating new hooks:

1. Follow the naming convention: `use<Domain><Action>` (e.g., `useInventory`, `useAsync`)
2. Add comprehensive JSDoc comments with `@example` tags
3. Use TypeScript generics for reusability
4. Include proper cleanup in `useEffect`
5. Memoize expensive computations
6. Export from `src/hooks/index.ts`
7. Add documentation to this README

---

## Related Documentation

- [React 19 Hooks Documentation](https://react.dev/reference/react)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/react.html)
- [Zustand Store Documentation](../stores/README.md)
- [Component Architecture](../components/README.md)
