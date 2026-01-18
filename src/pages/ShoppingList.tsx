/**
 * Shopping List Page Component for Aible
 *
 * A beautiful shopping list interface with green harmony theme and glassmorphism design.
 * Features empty state, manual add functionality, and checkbox interactions.
 */

import { useAuth } from '../lib/auth';
import {
  Plus,
  ShoppingCart,
  Check,
  Circle,
  Trash2,
  User,
  LogOut,
  Menu,
  ArrowLeft,
  ChefHat
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../components/shared';

interface ShoppingItem {
  id: string;
  name: string;
  quantity?: string;
  completed: boolean;
  addedAt: Date;
}

export default function ShoppingList() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [items, setItems] = useState<ShoppingItem[]>([]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      console.error('Failed to sign out:', error.message);
      alert('Failed to sign out. Please try again.');
    }
  };

  const getFirstName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'there';
  };

  const getProfilePicture = () => {
    return user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  };

  const handleAddItem = () => {
    alert('Add Item feature coming soon!');
  };

  const toggleItem = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 relative overflow-x-hidden flex flex-col">
      {/* Decorative Pattern Overlay */}
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
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="p-2 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer text-emerald-700"
                  aria-label="Go back to dashboard"
                >
                  <ArrowLeft className="w-5 h-5" />
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

              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-xl hover:bg-emerald-100 transition-colors text-emerald-600"
                aria-label="Toggle menu"
              >
                <Menu className="w-6 h-6 text-emerald-600" />
              </button>
            </div>
          </div>

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
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
            <div className="animate-slide-in-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-emerald-900 mb-2">
                Shopping List
              </h2>
              <p className="text-emerald-700 font-medium opacity-80">
                Items you need to purchase for your kitchen
              </p>
            </div>
            <button
              onClick={handleAddItem}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-200 hover:scale-[1.02] animate-fade-in-up animation-delay-200"
            >
              <Plus className="w-5 h-5" />
              <span>Add Item</span>
            </button>
          </div>
        </div>

        {/* Shopping List Content */}
        {items.length === 0 ? (
          /* Empty State */
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-emerald-100 p-12 lg:p-20 text-center shadow-sm hover:shadow-md transition-all duration-500 animate-fade-in-up animation-delay-300">
            <div className="w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-fade-in-up animation-delay-400 shadow-inner">
              <ShoppingCart className="w-12 h-12 text-emerald-600" strokeWidth={2} />
            </div>
            <h3 className="text-3xl font-bold text-emerald-900 mb-4 animate-fade-in-up animation-delay-500">
              Your shopping list is empty
            </h3>
            <p className="text-emerald-700 text-lg mb-10 max-w-lg mx-auto leading-relaxed animate-fade-in-up animation-delay-600 font-medium opacity-80">
              Items you need will automatically appear here based on your recipes and low inventory items.
            </p>
            <button
              onClick={handleAddItem}
              className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-200 hover:scale-105 animate-fade-in-up animation-delay-700"
            >
              <Plus className="w-6 h-6" />
              <span>Add Item Manually</span>
            </button>
          </div>
        ) : (
          /* Shopping List Items */
          <div className="space-y-4 animate-fade-in-up animation-delay-300">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-50 p-5 hover:shadow-md hover:border-emerald-200 transition-all duration-300 hover:scale-[1.01] group animate-fade-in-up"
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                <div className="flex items-center gap-5">
                  <button
                    onClick={() => toggleItem(item.id)}
                    className={`flex-shrink-0 w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-100 ${
                      item.completed
                        ? 'bg-emerald-500 border-emerald-500 scale-110'
                        : 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50'
                    }`}
                    aria-label={
                      item.completed ? 'Mark as incomplete' : 'Mark as complete'
                    }
                  >
                    {item.completed ? (
                      <Check className="w-5 h-5 text-white" strokeWidth={3} />
                    ) : (
                      <Circle className="w-4 h-4 text-emerald-100" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-lg font-bold transition-all duration-300 ${
                        item.completed
                          ? 'text-emerald-900/30 line-through'
                          : 'text-emerald-950'
                      }`}
                    >
                      {item.name}
                    </p>
                    {item.quantity && (
                      <p
                        className={`text-sm font-medium transition-all duration-300 ${
                          item.completed ? 'text-emerald-600/30' : 'text-emerald-600'
                        }`}
                      >
                        {item.quantity}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => deleteItem(item.id)}
                    className="flex-shrink-0 p-2.5 text-emerald-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 opacity-0 group-hover:opacity-100 focus:outline-none focus:ring-4 focus:ring-red-100"
                    aria-label="Delete item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {items.length > 0 && (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fade-in-up animation-delay-500">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-emerald-100 p-6 shadow-sm">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">Total Items</p>
              <p className="text-4xl font-black text-emerald-950">{items.length}</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-emerald-100 p-6 shadow-sm">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">Completed</p>
              <p className="text-4xl font-black text-emerald-500">
                {items.filter((item) => item.completed).length}
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-emerald-100 p-6 shadow-sm">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">Remaining</p>
              <p className="text-4xl font-black text-orange-500">
                {items.filter((item) => !item.completed).length}
              </p>
            </div>
          </div>
        )}
        {/* Footer - Minimal & Integrated */}
        <Footer />
      </main>
    </div>
  );
}
