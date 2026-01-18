import { create } from 'zustand';
import { fetchTransactions, createTransaction, updateTransaction } from '../services/transactionService';
import type { Transaction, TransactionInput } from '../types/database';
import { subDays } from 'date-fns';

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  lastFetched: number; // Timestamp

  // Actions
  fetchUserTransactions: (userId: string, force?: boolean) => Promise<void>;
  addTransaction: (transaction: TransactionInput) => Promise<Transaction | null>;
  updateTransactionInStore: (id: string, updates: Partial<TransactionInput>) => Promise<Transaction | null>;
  
  // Getters/Selectors
  getShoppingTripsCount: (days: number) => number;
  getRecentTransactions: (limit: number) => Transaction[];
}

// Cache duration: 5 minutes (can be adjusted)
const CACHE_DURATION = 5 * 60 * 1000;

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  loading: false,
  error: null,
  lastFetched: 0,

  fetchUserTransactions: async (userId: string, force = false) => {
    const { lastFetched, loading, transactions } = get();
    const now = Date.now();

    // Return cached data if valid and not forcing refresh
    if (!force && transactions.length > 0 && (now - lastFetched < CACHE_DURATION)) {
      return;
    }

    if (loading) return; // Prevent duplicate requests

    set({ loading: true, error: null });

    const { data, error } = await fetchTransactions(userId);

    if (error) {
      set({ error, loading: false });
    } else if (data) {
      set({ transactions: data, loading: false, lastFetched: now });
    } else {
      set({ loading: false });
    }
  },

  addTransaction: async (transaction) => {
    // Optimistic update could go here, but for now we wait for DB
    const { data, error } = await createTransaction(transaction);
    
    if (data) {
      set((state) => ({ 
        transactions: [data, ...state.transactions].sort((a, b) => 
          new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
        ) 
      }));
      return data;
    }
    
    if (error) {
      set({ error });
    }
    return null;
  },

  updateTransactionInStore: async (id, updates) => {
    const { data, error } = await updateTransaction(id, updates);

    if (data) {
      set((state) => ({
        transactions: state.transactions.map((t) => t.id === id ? data : t)
      }));
      return data;
    }

    if (error) {
      set({ error });
    }
    return null;
  },

  getShoppingTripsCount: (days: number) => {
    const { transactions } = get();
    const cutoffDate = subDays(new Date(), days);
    return transactions.filter(t => new Date(t.transaction_date) >= cutoffDate).length;
  },

  getRecentTransactions: (limit: number) => {
    const { transactions } = get();
    return transactions.slice(0, limit);
  }
}));
