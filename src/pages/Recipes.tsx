/**
 * Recipes Page Component for Aible
 *
 * Beautiful recipes page with green harmony theme and glassmorphism design.
 * Features saved recipes, AI-generated recipes, and favorites with empty states.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import {
  Sparkles,
  BookOpen,
  Heart,
  Star,
  User,
  LogOut,
  Menu,
  ArrowLeft,
  ChefHat
} from 'lucide-react';

export default function Recipes() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'saved' | 'ai' | 'favorites'>('saved');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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

  const handleGenerateRecipe = () => {
    alert('AI Recipe Generator feature coming soon!');
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
                  <h1 className="text-3xl font-bold hidden sm:block animate-shine">Aible</h1>
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
              >
                <Menu className="w-6 h-6" />
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
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
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
        {/* Header Section */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
            <div className="animate-slide-in-left">
              <h2 className="text-3xl font-bold text-emerald-900 mb-2">
                My Recipes
              </h2>
              <p className="text-emerald-700 font-medium opacity-80">
                Discover, save, and generate personalized recipes with AI
              </p>
            </div>

            {/* Generate Recipe Button */}
            <button
              onClick={handleGenerateRecipe}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-200 animate-fade-in-up animation-delay-200 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
              <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
              <span>Generate Recipe</span>
            </button>
          </div>

          {/* Tabs - Refined Glass Style */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-100 p-1.5 flex overflow-x-auto max-w-full gap-1.5 animate-fade-in-up animation-delay-300 scrollbar-hide">
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-4 sm:px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
                activeTab === 'saved'
                  ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100'
                  : 'text-emerald-600/70 hover:text-emerald-700 hover:bg-emerald-50/50'
              }`}
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Saved
              </span>
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`px-4 sm:px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
                activeTab === 'ai'
                  ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100'
                  : 'text-emerald-600/70 hover:text-emerald-700 hover:bg-emerald-50/50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Generated
              </span>
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-4 sm:px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
                activeTab === 'favorites'
                  ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100'
                  : 'text-emerald-600/70 hover:text-emerald-700 hover:bg-emerald-50/50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Favorites
              </span>
            </button>
          </div>
        </div>

        {/* Empty State - Consistent with Dashboard */}
        <div className="animate-fade-in-up animation-delay-400">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-emerald-100 p-12 lg:p-20 text-center shadow-sm hover:shadow-md transition-all duration-500">
            <div className="relative w-28 h-24 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full blur-3xl opacity-20 animate-pulse" />
              <div className="relative w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <Sparkles className="w-12 h-12 text-emerald-500 animate-pulse" strokeWidth={2} />
              </div>
              <Star className="absolute -top-2 -right-4 w-6 h-6 text-emerald-400 fill-emerald-400 animate-bounce" style={{ animationDuration: '3s' }} />
              <Star className="absolute -bottom-2 -left-4 w-5 h-5 text-green-400 fill-green-400 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }} />
            </div>

            <h3 className="text-3xl font-bold text-emerald-900 mb-4">
              No recipes yet
            </h3>
            <p className="text-emerald-700 text-lg mb-10 max-w-2xl mx-auto leading-relaxed font-medium opacity-80">
              Generate personalized recipes using AI based on your inventory, or save recipes you love from our library.
            </p>

            <button
              onClick={handleGenerateRecipe}
              className="group relative inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-200 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
              <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
              <span>Generate with AI</span>
            </button>

            <div className="mt-12 pt-8 border-t border-emerald-100">
              <p className="text-sm font-bold text-emerald-600/60 uppercase tracking-widest">
                Pro Tip: Add more items to your inventory for better matches
              </p>
            </div>
          </div>
        </div>

        {/* Footer - Minimal & Integrated */}
        <footer className="mt-auto py-8 text-center border-t border-emerald-100/50">
          <p className="text-sm font-medium text-emerald-800/60">
            &copy; 2026 Aible &bull; Your AI-Powered Kitchen Assistant
          </p>
        </footer>
      </main>
    </div>
  );
}
