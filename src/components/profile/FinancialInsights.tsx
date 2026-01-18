import { useState, useEffect } from 'react';
import {
  TrendingUp,
  PieChart,
  Calendar,
  ShoppingBag,
  ArrowRight,
  Edit2,
  X,
  Check,
  Loader2,
  Plus
} from 'lucide-react';
import { fetchUserBudget, updateUserBudget } from '../../services/transactionService';
import { useTransactionStore } from '../../stores/transactionStore';
import type { Transaction, UserBudget } from '../../types/database';

interface FinancialInsightsProps {
  userId: string;
}

export default function FinancialInsights({ userId }: FinancialInsightsProps) {
  // Use Transaction Store
  const { 
    transactions, 
    loading: txLoading, 
    fetchUserTransactions, 
    addTransaction, 
    updateTransactionInStore 
  } = useTransactionStore();

  const [budget, setBudget] = useState<UserBudget | null>(null);
  const [budgetLoading, setBudgetLoading] = useState(true);
  
  // Budget Edit State
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudgetLimit, setNewBudgetLimit] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('GBP');
  const [isSavingBudget, setIsSavingBudget] = useState(false);

  // Manual Transaction State
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isSavingTransaction, setIsSavingTransaction] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [newTransaction, setNewTransaction] = useState({
    store: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: 'groceries'
  });

  useEffect(() => {
    async function loadData() {
      setBudgetLoading(true);
      
      // Fetch budget (local state)
      const { data } = await fetchUserBudget(userId);
      if (data) {
        setBudget(data);
        setNewBudgetLimit(String(data.monthly_limit));
        setSelectedCurrency(data.currency);
      }
      setBudgetLoading(false);

      // Fetch transactions (store cache)
      await fetchUserTransactions(userId);
    }

    loadData();
  }, [userId, fetchUserTransactions]);

  const handleSaveBudget = async () => {
    if (!newBudgetLimit || isNaN(Number(newBudgetLimit))) return;
    
    setIsSavingBudget(true);
    const { data } = await updateUserBudget(userId, {
      monthly_limit: Number(newBudgetLimit),
      currency: selectedCurrency
    });

    if (data) {
      setBudget(data);
      setIsEditingBudget(false);
    }
    setIsSavingBudget(false);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransactionId(transaction.id);
    const category = transaction.category_breakdown 
      ? Object.keys(transaction.category_breakdown)[0] 
      : 'groceries';
      
    setNewTransaction({
      store: transaction.store_name,
      date: transaction.transaction_date,
      amount: String(transaction.total_amount),
      category: category || 'groceries'
    });
    setIsAddingTransaction(true);
  };

  const handleSaveTransaction = async () => {
    if (!newTransaction.store || !newTransaction.amount) return;

    setIsSavingTransaction(true);
    const amount = Number(newTransaction.amount);
    
    if (editingTransactionId) {
      // Update existing transaction via Store
      const updatedTx = await updateTransactionInStore(editingTransactionId, {
        store_name: newTransaction.store,
        transaction_date: newTransaction.date,
        total_amount: amount,
        category_breakdown: { [newTransaction.category]: amount },
        currency: selectedCurrency
      });

      if (updatedTx) {
        setIsAddingTransaction(false);
        setEditingTransactionId(null);
        resetTransactionForm();
      }
    } else {
      // Create new transaction via Store
      const newTx = await addTransaction({
        user_id: userId,
        store_name: newTransaction.store,
        transaction_date: newTransaction.date,
        total_amount: amount,
        currency: selectedCurrency,
        category_breakdown: { [newTransaction.category]: amount },
        is_verified: true,
        source: 'manual'
      });

      if (newTx) {
        setIsAddingTransaction(false);
        resetTransactionForm();
      }
    }
    setIsSavingTransaction(false);
  };

  const resetTransactionForm = () => {
    setNewTransaction({
      store: '',
      date: new Date().toISOString().split('T')[0],
      amount: '',
      category: 'groceries'
    });
  };

  // Helper for formatting currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedCurrency,
    }).format(amount);
  };

  // Calculations
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

  // Category Breakdown
  const categorySpend: Record<string, number> = {};
  monthlyTransactions.forEach(t => {
    Object.entries(t.category_breakdown || {}).forEach(([cat, amount]) => {
      categorySpend[cat] = (categorySpend[cat] || 0) + (amount as number);
    });
  });

  const sortedCategories = Object.entries(categorySpend)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5); // Top 5

  const maxCategorySpend = sortedCategories.length > 0 ? sortedCategories[0][1] : 1;

  const getCurrencySymbol = () => {
    switch (selectedCurrency) {
      case 'GBP': return '£';
      case 'EUR': return '€';
      default: return '$';
    }
  };

  if (txLoading && budgetLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-emerald-600 font-medium">Analyzing finances...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Health Score & Budget Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Budget Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-emerald-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Monthly Budget</p>
                {!isEditingBudget && (
                  <button 
                    onClick={() => setIsEditingBudget(true)}
                    className="p-1 text-gray-400 hover:text-emerald-600 transition-colors"
                    title="Edit Budget"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              
              {isEditingBudget ? (
                <div className="flex items-center gap-2 mt-2">
                  <select
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveBudget()}
                    className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-lg font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer appearance-none"
                  >
                    <option value="GBP">£ GBP</option>
                    <option value="USD">$ USD</option>
                    <option value="EUR">€ EUR</option>
                    <option value="CAD">$ CAD</option>
                    <option value="AUD">$ AUD</option>
                  </select>
                  <div className="relative">
                    <input
                      type="number"
                      value={newBudgetLimit}
                      onChange={(e) => setNewBudgetLimit(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveBudget()}
                      className="w-32 text-2xl font-black text-gray-900 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      autoFocus
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex gap-1 ml-1">
                    <button
                      onClick={handleSaveBudget}
                      disabled={isSavingBudget}
                      className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200"
                    >
                      {isSavingBudget ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingBudget(false);
                        setNewBudgetLimit(String(budgetLimit));
                        setSelectedCurrency(budget?.currency || 'GBP');
                      }}
                      className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <h3 className="text-3xl font-black text-gray-900 mt-1">
                  {formatCurrency(totalSpent)} <span className="text-lg text-gray-400 font-medium">/ {formatCurrency(budgetLimit)}</span>
                </h3>
              )}
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 transition-colors duration-500 ${remaining >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
              {getCurrencySymbol()}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div 
              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${
                percentageUsed > 90 ? 'bg-red-500' : percentageUsed > 75 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${percentageUsed}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs font-bold">
            <span className={remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}>
              {percentageUsed}% Used
            </span>
            <span className="text-gray-400">
              {remaining >= 0 ? `${formatCurrency(remaining)} remaining` : `${formatCurrency(Math.abs(remaining))} over`}
            </span>
          </div>
        </div>

        {/* Financial Insight Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-indigo-200" />
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-100">AI Insight</span>
            </div>
            
            <div>
              <h4 className="text-xl font-bold mb-2">Spending on Track</h4>
              <p className="text-indigo-100 text-sm leading-relaxed mb-4">
                You're spending 12% less on Dairy compared to last month. Great job sticking to your essentials list!
              </p>
            </div>

            <button className="flex items-center gap-2 text-xs font-bold bg-white/20 hover:bg-white/30 px-4 py-2.5 rounded-xl transition-colors w-fit">
              View Full Report <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Spending Breakdown & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-emerald-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-emerald-600" />
              Top Categories
            </h4>
          </div>

          <div className="space-y-5">
            {sortedCategories.length > 0 ? sortedCategories.map(([cat, amount], idx) => (
              <div key={cat} className="group">
                <div className="flex justify-between text-sm font-medium mb-1.5">
                  <span className="capitalize text-gray-700 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    {cat}
                  </span>
                  <span className="font-bold text-gray-900">{formatCurrency(amount)}</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full group-hover:bg-emerald-400 transition-colors duration-300"
                    style={{ width: `${(amount / maxCategorySpend) * 100}%` }}
                  ></div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">No category data yet</div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-emerald-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              Recent
            </h4>
            <button
              onClick={() => {
                setIsAddingTransaction(true);
                setEditingTransactionId(null);
                setNewTransaction({
                  store: '',
                  date: new Date().toISOString().split('T')[0],
                  amount: '',
                  category: 'groceries'
                });
              }}
              className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-colors"
              title="Add Transaction"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 max-h-[300px] pr-2 custom-scrollbar">
            {transactions.length > 0 ? transactions.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{t.store_name}</p>
                  <p className="text-xs text-gray-500">{t.transaction_date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900">-{formatCurrency(t.total_amount)}</span>
                  <button 
                    onClick={() => handleEditTransaction(t)}
                    className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">No transactions</div>
            )}
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isAddingTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingTransactionId ? 'Edit Transaction' : 'Add Transaction'}
              </h3>
              <button onClick={() => setIsAddingTransaction(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Store Name</label>
                <input
                  type="text"
                  value={newTransaction.store}
                  onChange={(e) => setNewTransaction({...newTransaction, store: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="e.g. Tesco, Walmart"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                <select
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="groceries">Groceries</option>
                  <option value="dining">Dining Out</option>
                  <option value="household">Household</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <button
                onClick={handleSaveTransaction}
                disabled={isSavingTransaction || !newTransaction.store || !newTransaction.amount}
                className="w-full mt-4 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isSavingTransaction ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>{editingTransactionId ? 'Update Transaction' : 'Add Transaction'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}