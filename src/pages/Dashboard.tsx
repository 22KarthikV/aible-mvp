/**
 * Dashboard Page Component for Aible
 *
 * The main dashboard page shown after login.
 * Features welcome message, stats, quick actions, and recent activity.
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import {
  Plus,
  Scan,
  Sparkles,
  ShoppingCart,
  Package,
  BookOpen,
  LogOut,
  User,
  Menu,
  ChefHat,
  ChevronRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Footer } from '../components/shared';
import { useInventoryStore } from '../stores/inventoryStore';
import { fetchInventoryItems } from '../services/inventoryService';
import { useTransactionStore } from '../stores/transactionStore';
import {
  ExpiringSoonWidget,
  RecentActivityWidget,
  BudgetOverviewWidget,
  QuickStatsWidget,
} from '../components/dashboard';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Inventory Store
  const { items, setItems, loading: inventoryLoading, setLoading: setInventoryLoading, setError: setInventoryError } = useInventoryStore();
  
  // Transaction Store
  const { fetchUserTransactions, getShoppingTripsCount, loading: txLoading } = useTransactionStore();
  const shoppingTrips = getShoppingTripsCount(7);

  /**
   * Fetch real-time data
   */
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;

      // Load Inventory (uses its own internal check usually, but here we check length)
      if (items.length === 0 && !inventoryLoading) {
        setInventoryLoading(true);
        try {
          const { data: fetchedItems, error: fetchError } = await fetchInventoryItems(user.id);
          if (fetchError) {
            setInventoryError(fetchError);
          } else if (fetchedItems) {
            setItems(fetchedItems);
          }
        } catch (err) {
          console.error('Failed to fetch inventory count:', err);
          setInventoryError('Failed to load inventory data');
        } finally {
          setInventoryLoading(false);
        }
      }

      // Load Transactions (Cached)
      await fetchUserTransactions(user.id);
    };

    loadData();
  }, [user?.id, items.length, inventoryLoading, setItems, setInventoryLoading, setInventoryError, fetchUserTransactions]);

  /**
   * Calculate real-time stats from inventory data
   */
  const inventoryCount = items.length;
  const recipesCount = 0; // TODO: Implement when recipe feature is added

  /**
   * Handle sign out

  /**
   * Handle sign out
   * Shows loading state and signs user out
   */
  const handleSignOut = async () => {
    const { error } = await signOut();

    if (error) {
      console.error('Failed to sign out:', error.message);
      alert('Failed to sign out. Please try again.');
    }
  };

  /**
   * Get user's first name from full name or email
   */
  const getFirstName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'there';
  };

  /**
   * Get user's profile picture or default avatar
   */
  const getProfilePicture = () => {
    return user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 relative overflow-x-hidden flex flex-col">
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="dot-pattern"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1" fill="currentColor" className="text-emerald-400" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-pattern)" />
        </svg>
      </div>

      {/* Header - Floating Island Style */}
      <div className="fixed top-4 left-4 right-4 z-50">
        <header className="max-w-[1600px] mx-auto bg-white/70 backdrop-blur-md border border-emerald-200/50 rounded-2xl shadow-sm transition-all duration-300">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo and App Name */}
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer border-none outline-none focus:outline-none focus:ring-0 ring-0 group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                  <ChefHat className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <h1 className="text-5xl lg:text-6xl font-black tracking-tight hidden sm:block animate-shine">
                  Aible
                </h1>
              </button>

              {/* Desktop: User Profile */}
              <div className="hidden md:flex items-center gap-4">
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-3 hover:bg-emerald-50 rounded-xl px-3 py-1.5 transition-colors cursor-pointer border border-transparent hover:border-emerald-100"
                >
                  {getProfilePicture() ? (
                    <img
                      src={getProfilePicture()}
                      alt="Profile"
                      className="w-9 h-9 rounded-full border border-emerald-200"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-emerald-600" />
                    </div>
                  )}
                  <div className="text-sm text-left">
                    <p className="font-semibold text-emerald-900 leading-tight">{getFirstName()}</p>
                    <p className="text-emerald-600 text-xs leading-tight">{user?.email}</p>
                  </div>
                </button>
              </div>

              {/* Mobile: Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-xl hover:bg-emerald-100 transition-colors text-emerald-600"
                aria-label="Toggle menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden py-4 px-4 border-t border-emerald-100 bg-white/90 rounded-b-2xl">
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-3 mb-4 w-full hover:bg-emerald-50 rounded-xl p-2 transition-colors"
              >
                {getProfilePicture() ? (
                  <img
                    src={getProfilePicture()}
                    alt="Profile"
                    className="w-12 h-12 rounded-full border-2 border-emerald-200"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-emerald-600" />
                  </div>
                )}
                <div className="text-sm">
                  <p className="font-medium text-emerald-900">{getFirstName()}</p>
                  <p className="text-emerald-700">{user?.email}</p>
                </div>
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors duration-200 shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </header>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 relative z-10">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 animate-slide-in-left">
            Welcome back, {getFirstName()}!
          </h2>
          <p className="text-gray-600 animate-slide-in-left animation-delay-100 font-medium">
            Here's what's happening with your kitchen today
          </p>
        </div>

        {/* Stats Grid - Clickable Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {/* Stat Card 1: Items in Inventory - Real-time count from Supabase */}
          <button
            onClick={() => navigate('/inventory')}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-100 p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 animate-fade-in-up animation-delay-200 group text-left cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-500 transition-colors duration-300">
                <Package className="w-6 h-6 text-emerald-600 group-hover:text-white" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {inventoryLoading ? '...' : inventoryCount}
            </h3>
            <p className="text-sm font-medium text-emerald-700">Items in Inventory</p>
          </button>

          {/* Stat Card 2: Recipes Saved - Coming in Sprint 4 */}
          <button
            onClick={() => navigate('/recipes')}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-100 p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 animate-fade-in-up animation-delay-300 group text-left cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors duration-300">
                <BookOpen className="w-6 h-6 text-blue-600 group-hover:text-white" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{recipesCount}</h3>
            <p className="text-sm font-medium text-blue-700">Recipes Saved</p>
          </button>

          {/* Stat Card 3: Shopping Trips (Last 7 Days) */}
          <button
            onClick={() => navigate('/shopping-list')}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-100 p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 animate-fade-in-up animation-delay-400 group text-left cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center group-hover:bg-teal-500 transition-colors duration-300">
                <ShoppingCart className="w-6 h-6 text-teal-600 group-hover:text-white" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 transition-colors" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{txLoading ? '...' : shoppingTrips}</h3>
            <p className="text-sm font-medium text-teal-700">Shopping Trips (7d)</p>
          </button>
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-fade-in animation-delay-500">
          <ExpiringSoonWidget items={items} loading={inventoryLoading} />
          <RecentActivityWidget items={items} loading={inventoryLoading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-fade-in animation-delay-600">
          <BudgetOverviewWidget loading={txLoading} />
          <QuickStatsWidget items={items} shoppingTrips={shoppingTrips} loading={inventoryLoading || txLoading} />
        </div>

        {/* Quick Actions Section */}
        <div className="mb-10 animate-fade-in animation-delay-700">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h3>

          {/* Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Action 1: Add Item */}
            <button
              onClick={() => navigate('/inventory')}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-50 p-6 hover:shadow-xl hover:border-emerald-400 hover:scale-[1.02] transition-all duration-300 text-left group focus:outline-none focus:ring-4 focus:ring-emerald-100 animate-fade-in-up animation-delay-600"
            >
              <div className="w-14 h-14 bg-emerald-100 group-hover:bg-emerald-500 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-90">
                <Plus className="w-7 h-7 text-emerald-600 group-hover:text-white transition-colors duration-300" strokeWidth={2.5} />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">Add Item</h4>
              <p className="text-sm text-gray-600">
                Manually add items to your inventory
              </p>
            </button>

            {/* Action 2: Scan Barcode */}
            <button
              onClick={() => navigate('/inventory')}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-50 p-6 hover:shadow-xl hover:border-blue-400 hover:scale-[1.02] transition-all duration-300 text-left group focus:outline-none focus:ring-4 focus:ring-blue-100 animate-fade-in-up animation-delay-700"
            >
              <div className="w-14 h-14 bg-blue-100 group-hover:bg-blue-500 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110">
                <Scan className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors duration-300" strokeWidth={2.5} />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">Scan Barcode</h4>
              <p className="text-sm text-gray-600">
                Quick add items by scanning barcodes
              </p>
            </button>

            {/* Action 3: Generate Recipe */}
            <button
              onClick={() => navigate('/recipes')}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-50 p-6 hover:shadow-xl hover:border-purple-400 hover:scale-[1.02] transition-all duration-300 text-left group focus:outline-none focus:ring-4 focus:ring-purple-100 animate-fade-in-up animation-delay-800"
            >
              <div className="w-14 h-14 bg-purple-100 group-hover:bg-purple-500 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110">
                <Sparkles className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors duration-300" strokeWidth={2.5} />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">Generate Recipe</h4>
              <p className="text-sm text-gray-600">
                AI-powered recipe suggestions
              </p>
            </button>

            {/* Action 4: Shopping List */}
            <button
              onClick={() => navigate('/shopping-list')}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-50 p-6 hover:shadow-xl hover:border-orange-400 hover:scale-[1.02] transition-all duration-300 text-left group focus:outline-none focus:ring-4 focus:ring-orange-100 animate-fade-in-up animation-delay-900"
            >
              <div className="w-14 h-14 bg-orange-100 group-hover:bg-orange-500 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110">
                <ShoppingCart className="w-7 h-7 text-orange-600 group-hover:text-white transition-colors duration-300" strokeWidth={2.5} />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">Shopping List</h4>
              <p className="text-sm text-gray-600">
                View and manage your shopping list
              </p>
            </button>
          </div>
        </div>

        {/* Footer - Minimal & Integrated */}
        <Footer />
      </main>
    </div>
  );
}
