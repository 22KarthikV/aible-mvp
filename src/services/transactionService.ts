/**
 * Transaction Service
 *
 * Handles database operations for financial transactions and budget tracking.
 */

import { supabase } from '../lib/supabase';
import type { Transaction, TransactionInput, UserBudget, UserBudgetInput } from '../types/database';

// ============================================================================
// TRANSACTIONS
// ============================================================================

/**
 * Create a new transaction log
 */
export async function createTransaction(transaction: TransactionInput) {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction])
    .select()
    .single();

  if (error) {
    console.error('Error creating transaction:', error);
    return { data: null, error: error.message };
  }

  return { data: data as Transaction, error: null };
}

/**
 * Fetch transactions for a user
 */
export async function fetchTransactions(userId: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('transaction_date', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    return { data: null, error: error.message };
  }

  return { data: data as Transaction[], error: null };
}

/**
 * Update a transaction
 */
export async function updateTransaction(id: string, updates: Partial<TransactionInput>) {
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating transaction:', error);
    return { data: null, error: error.message };
  }

  return { data: data as Transaction, error: null };
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(id: string) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting transaction:', error);
    return { error: error.message };
  }

  return { error: null };
}

// ============================================================================
// USER BUDGETS
// ============================================================================

/**
 * Get or create user budget settings
 */
export async function fetchUserBudget(userId: string) {
  // Try to get existing budget
  const { data, error } = await supabase
    .from('user_budgets')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = JSON object requested, multiple (or no) rows returned
    console.error('Error fetching user budget:', error);
    return { data: null, error: error.message };
  }

  if (data) {
    return { data: data as UserBudget, error: null };
  }

  // If no budget exists, create default
  const defaultBudget: UserBudgetInput = {
    user_id: userId,
    monthly_limit: 500,
    currency: 'GBP',
    alert_threshold: 80,
    rollover_savings: false,
    budget_start_day: 1
  };

  const { data: newBudget, error: createError } = await supabase
    .from('user_budgets')
    .insert([defaultBudget])
    .select()
    .single();

  if (createError) {
    console.error('Error creating default budget:', createError);
    return { data: null, error: createError.message };
  }

  return { data: newBudget as UserBudget, error: null };
}

/**
 * Update user budget settings
 */
export async function updateUserBudget(userId: string, updates: Partial<UserBudgetInput>) {
  const { data, error } = await supabase
    .from('user_budgets')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating budget:', error);
    return { data: null, error: error.message };
  }

  return { data: data as UserBudget, error: null };
}
