/**
 * useFinance Hook
 *
 * Hook for managing financial data including budget and transactions.
 * Combines budget and transaction management with caching and computed values.
 *
 * @example
 * const {
 *   budget,
 *   transactions,
 *   loading,
 *   updateBudget,
 *   addTransaction,
 *   monthlySpending
 * } = useFinance(userId);
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTransactionStore } from '../stores/transactionStore';
import {
  fetchUserBudget,
  updateUserBudget
} from '../services/transactionService';
import type { Transaction, UserBudget, TransactionInput } from '../types/database';

interface TopCategory {
  category: string;
  amount: number;
}

interface UseFinanceReturn {
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
  topCategories: TopCategory[];
  recentTransactions: Transaction[];

  // Actions
  updateBudget: (updates: Partial<UserBudget>) => Promise<void>;
  addTransaction: (transaction: TransactionInput) => Promise<void>;
  updateTransactionById: (id: string, updates: Partial<TransactionInput>) => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useFinance(userId: string): UseFinanceReturn {
  // Budget state
  const [budget, setBudget] = useState<UserBudget | null>(null);
  const [budgetLoading, setBudgetLoading] = useState(true);
  const [budgetError, setBudgetError] = useState<string | null>(null);

  // Transaction store
  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
    fetchUserTransactions,
    addTransaction: addTransactionToStore,
    updateTransactionInStore,
  } = useTransactionStore();

  /**
   * Fetch budget data
   */
  const fetchBudget = useCallback(async () => {
    setBudgetLoading(true);
    setBudgetError(null);

    const { data, error } = await fetchUserBudget(userId);

    if (error) {
      setBudgetError(error);
    } else if (data) {
      setBudget(data);
    }

    setBudgetLoading(false);
  }, [userId]);

  /**
   * Fetch all financial data on mount or userId change
   */
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchBudget(),
        fetchUserTransactions(userId)
      ]);
    };

    loadData();
  }, [userId, fetchBudget, fetchUserTransactions]);

  /**
   * Update budget
   */
  const updateBudget = useCallback(
    async (updates: Partial<UserBudget>) => {
      setBudgetLoading(true);
      setBudgetError(null);

      const { data, error } = await updateUserBudget(userId, updates);

      if (error) {
        setBudgetError(error);
        throw new Error(error);
      }

      if (data) {
        setBudget(data);
      }

      setBudgetLoading(false);
    },
    [userId]
  );

  /**
   * Add new transaction
   */
  const addTransaction = useCallback(
    async (transaction: TransactionInput) => {
      const newTransaction = await addTransactionToStore(transaction);
      if (!newTransaction) {
        throw new Error('Failed to add transaction');
      }
    },
    [addTransactionToStore]
  );

  /**
   * Update existing transaction
   */
  const updateTransactionById = useCallback(
    async (id: string, updates: Partial<TransactionInput>) => {
      const updatedTransaction = await updateTransactionInStore(id, updates);
      if (!updatedTransaction) {
        throw new Error('Failed to update transaction');
      }
    },
    [updateTransactionInStore]
  );

  /**
   * Refresh all data
   */
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchBudget(),
      fetchUserTransactions(userId, true) // Force refresh
    ]);
  }, [fetchBudget, fetchUserTransactions, userId]);

  /**
   * Computed: Monthly spending (current month)
   */
  const monthlySpending = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyTransactions = transactions.filter(t => {
      const d = new Date(t.transaction_date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    return monthlyTransactions.reduce((sum, t) => sum + t.total_amount, 0);
  }, [transactions]);

  /**
   * Computed: Budget usage percentage
   */
  const budgetUsagePercentage = useMemo(() => {
    const limit = budget?.monthly_limit || 500;
    return Math.min(100, Math.round((monthlySpending / limit) * 100));
  }, [monthlySpending, budget?.monthly_limit]);

  /**
   * Computed: Budget remaining
   */
  const budgetRemaining = useMemo(() => {
    const limit = budget?.monthly_limit || 500;
    return limit - monthlySpending;
  }, [monthlySpending, budget?.monthly_limit]);

  /**
   * Computed: Top categories by spending (current month)
   */
  const topCategories = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyTransactions = transactions.filter(t => {
      const d = new Date(t.transaction_date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const categorySpend: Record<string, number> = {};
    monthlyTransactions.forEach(t => {
      Object.entries(t.category_breakdown || {}).forEach(([cat, amount]) => {
        categorySpend[cat] = (categorySpend[cat] || 0) + (amount as number);
      });
    });

    return Object.entries(categorySpend)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5); // Top 5 categories
  }, [transactions]);

  /**
   * Computed: Recent transactions
   */
  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 10); // Latest 10 transactions
  }, [transactions]);

  return {
    // Budget state
    budget,
    budgetLoading,
    budgetError,

    // Transaction state
    transactions,
    transactionsLoading,
    transactionsError: transactionsError || null,

    // Computed values
    monthlySpending,
    budgetUsagePercentage,
    budgetRemaining,
    topCategories,
    recentTransactions,

    // Actions
    updateBudget,
    addTransaction,
    updateTransactionById,
    refreshData,
  };
}
