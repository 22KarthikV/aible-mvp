/**
 * Inventory Page Component for Aible
 *
 * Displays user's kitchen inventory with options to add items manually or scan barcodes.
 * Features empty state with glassmorphism design and green harmony theme.
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import {
  Plus,
  Package,
  Scan,
  LogOut,
  User,
  Menu,
  Search,
  Filter,
  ArrowLeft,
  Sparkles,
  ShoppingCart,
  ChefHat
} from 'lucide-react';
import { useState } from 'react';
import Footer from '../components/Footer';

export default function Inventory() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="p-2 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                  aria-label="Go back to dashboard"
                >
                  <ArrowLeft className="w-5 h-5 text-emerald-700" />
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-3 cursor-pointer group"
                  style={{ border: 'none', outline: 'none', background: 'none', padding: 0 }}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                    <ChefHat className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <h1 className="text-5xl lg:text-6xl font-black tracking-tight hidden sm:block animate-shine">
                    Aible
                  </h1>
                </button>
              </div>

              {/* Desktop: User Profile */}
              <div className="hidden md:flex items-center gap-3">
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
                <Menu className="w-6 h-6 text-emerald-600" />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden py-4 px-4 border-t border-emerald-100 bg-white/90 rounded-b-2xl">
              <div className="flex items-center gap-3 mb-4">
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
                  <p className="font-bold text-emerald-900">{getFirstName()}</p>
                  <p className="text-emerald-700">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors duration-200"
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
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-emerald-900 mb-2 animate-slide-in-left">
              Inventory
            </h2>
            <p className="text-emerald-700 animate-slide-in-left animation-delay-100 font-medium">
              Track and manage your kitchen items
            </p>
          </div>

          {/* Add Item Button - Desktop */}
          <button
            onClick={() => alert('Add Item feature coming soon!')}
            className="hidden sm:flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-200 cursor-pointer animate-fade-in animation-delay-200"
          >
            <Plus className="w-5 h-5" />
            <span>Add Item</span>
          </button>
        </div>

        {/* Search and Filter Bar - Minimalist Refactor */}
        <div className="mb-8 animate-fade-in animation-delay-300">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500 group-focus-within:text-emerald-600 transition-colors" />
              <input
                type="text"
                placeholder="Search inventory..."
                disabled
                className="w-full pl-12 pr-4 py-3.5 bg-emerald-100/30 border border-emerald-200/50 rounded-2xl text-emerald-900 placeholder-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:bg-white focus:border-emerald-300 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed font-medium"
              />
            </div>

            {/* Filter Button */}
            <button
              disabled
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-emerald-200/50 text-emerald-700 font-bold rounded-2xl hover:bg-emerald-50 hover:border-emerald-300 shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              <Filter className="w-5 h-5" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Empty State */}
        <div className="animate-fade-in animation-delay-400">
          <div className="bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-3xl p-8 sm:p-16 text-center shadow-sm hover:shadow-md transition-all duration-500">
            {/* Icon */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-fade-in-up animation-delay-500">
              <Package className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-600" />
            </div>

            {/* Heading */}
            <h3 className="text-2xl sm:text-3xl font-bold text-emerald-900 mb-3 animate-fade-in-up animation-delay-600">
              Your inventory is empty
            </h3>

            {/* Description */}
            <p className="text-emerald-700 text-base sm:text-lg mb-8 max-w-md mx-auto leading-relaxed animate-fade-in-up animation-delay-700 font-medium opacity-80">
              Start tracking your kitchen items by adding them manually or scanning barcodes
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-800">
              {/* Primary Button - Add Item Manually */}
              <button
                onClick={() => alert('Add Item Manually feature coming soon!')}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl hover:shadow-emerald-500/30 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-200 cursor-pointer"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                <span>Add Item Manually</span>
              </button>

              {/* Secondary Button - Scan Barcode */}
              <button
                onClick={() => alert('Scan Barcode feature coming soon!')}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-emerald-300 text-emerald-700 font-bold rounded-xl shadow-md hover:shadow-xl hover:bg-emerald-50 hover:border-emerald-400 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-200 cursor-pointer"
              >
                <Scan className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span>Scan Barcode</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-10 animate-fade-in animation-delay-500">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Action 1: Add Item */}
            <button
              onClick={() => alert('Add Item feature coming soon!')}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-50 p-6 hover:shadow-xl hover:border-emerald-400 hover:scale-[1.02] transition-all duration-300 text-left group focus:outline-none focus:ring-4 focus:ring-emerald-100 animate-fade-in-up animation-delay-600"
            >
              <div className="w-14 h-14 bg-emerald-100 group-hover:bg-emerald-500 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-90">
                <Plus className="w-7 h-7 text-emerald-600 group-hover:text-white transition-colors duration-300" strokeWidth={2.5} />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">Add Item</h4>
              <p className="text-sm text-gray-600">
                Manually add items
              </p>
            </button>

            {/* Action 2: Scan Barcode */}
            <button
              onClick={() => alert('Scan Barcode feature coming soon!')}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-50 p-6 hover:shadow-xl hover:border-blue-400 hover:scale-[1.02] transition-all duration-300 text-left group focus:outline-none focus:ring-4 focus:ring-blue-100 animate-fade-in-up animation-delay-700"
            >
              <div className="w-14 h-14 bg-blue-100 group-hover:bg-blue-500 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110">
                <Scan className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors duration-300" strokeWidth={2.5} />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">Scan Barcode</h4>
              <p className="text-sm text-gray-600">
                Quick add items
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
                AI-powered suggestions
              </p>
            </button>

            {/* Action 4: Shopping List */}
            <button
              onClick={() => navigate('/shopping-list')}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-50 p-6 hover:shadow-xl hover:border-orange-400 hover:scale-[1.02] transition-all duration-300 text-left group focus:outline-none focus:ring-4 focus:ring-orange-200 animate-fade-in-up animation-delay-900"
            >
              <div className="w-14 h-14 bg-orange-100 group-hover:bg-orange-500 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110">
                <ShoppingCart className="w-7 h-7 text-orange-600 group-hover:text-white transition-colors duration-300" strokeWidth={2.5} />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">Shopping List</h4>
              <p className="text-sm text-gray-600">
                Manage your list
              </p>
            </button>
          </div>
        </div>

        {/* Mobile Add Item Button - Fixed at bottom */}
        <button
          onClick={() => alert('Add Item feature coming soon!')}
          className="sm:hidden fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-full shadow-2xl hover:shadow-emerald-500/50 hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-200 cursor-pointer flex items-center justify-center z-50 animate-bounce-slow"
          aria-label="Add item"
        >
          <Plus className="w-7 h-7" strokeWidth={2.5} />
        </button>
        {/* Footer - Minimal & Integrated */}
        <Footer />
      </main>
    </div>
  );
}