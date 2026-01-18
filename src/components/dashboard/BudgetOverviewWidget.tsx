/**
 * Budget Overview Widget Component
 *
 * Displays monthly spending against budget with progress bar
 */

import { useNavigate } from 'react-router-dom';
import { DollarSign, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { useTransactionStore } from '../../stores/transactionStore';
import { startOfMonth, endOfMonth } from 'date-fns';

interface BudgetOverviewWidgetProps {
  loading?: boolean;
}

export function BudgetOverviewWidget({ loading }: BudgetOverviewWidgetProps) {
  const navigate = useNavigate();
  const { transactions } = useTransactionStore();

  // Calculate monthly spending (current month)
  const currentMonthStart = startOfMonth(new Date());
  const currentMonthEnd = endOfMonth(new Date());

  const monthlyTransactions = transactions.filter((tx) => {
    const txDate = new Date(tx.transaction_date);
    return txDate >= currentMonthStart && txDate <= currentMonthEnd;
  });

  const monthlySpending = monthlyTransactions.reduce((sum, tx) => sum + tx.total_amount, 0);

  // Default budget (user can customize in profile)
  const monthlyBudget = 500; // TODO: Load from user_budgets table
  const percentage = Math.min(100, (monthlySpending / monthlyBudget) * 100);
  const remaining = monthlyBudget - monthlySpending;

  /**
   * Get status color based on percentage
   */
  const getStatusColor = (): string => {
    if (percentage >= 100) return 'text-red-700 bg-red-100';
    if (percentage >= 80) return 'text-amber-700 bg-amber-100';
    if (percentage >= 50) return 'text-yellow-700 bg-yellow-100';
    return 'text-emerald-700 bg-emerald-100';
  };

  /**
   * Get progress bar color
   */
  const getProgressColor = (): string => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-amber-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-100 p-6 h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Budget This Month
          </h3>
        </div>
        <div className="space-y-4">
          <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-3 bg-gray-100 rounded animate-pulse" />
          <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-100 p-6 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          Budget This Month
        </h3>
      </div>

      {/* Spending amount */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-bold text-gray-900">
            ${monthlySpending.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500">/ ${monthlyBudget.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2">
          {remaining >= 0 ? (
            <>
              <TrendingDown className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">
                ${remaining.toFixed(2)} remaining
              </span>
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">
                ${Math.abs(remaining).toFixed(2)} over budget
              </span>
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Progress</span>
          <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${getStatusColor()}`}>
            {percentage.toFixed(0)}%
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${getProgressColor()} transition-all duration-500 rounded-full`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
      </div>

      {/* Shopping trips */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
        <span className="text-sm text-gray-600">Shopping trips this month</span>
        <span className="text-lg font-bold text-gray-900">{monthlyTransactions.length}</span>
      </div>

      {/* View details button */}
      <button
        onClick={() => navigate('/profile')}
        className="mt-auto w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
      >
        <span>View Financial Details</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
