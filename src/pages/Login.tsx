/**
 * Login Page Component for Aible
 *
 * A beautiful, responsive login page with Google OAuth authentication.
 * Features split-screen layout on desktop, full-screen on mobile.
 */

import { useAuth } from '../lib/auth';
import { ChefHat, Loader2, Sparkles, Package, ShoppingCart } from 'lucide-react';

export default function Login() {
  const { signInWithGoogle, loading } = useAuth();

  /**
   * Handle sign-in button click
   * Shows loading state and triggers Google OAuth flow
   */
  const handleSignIn = async () => {
    const { error } = await signInWithGoogle();

    if (error) {
      // In production, you'd want to show this in a toast/notification
      console.error('Failed to sign in:', error.message);
      alert('Failed to sign in. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
      {/* Left Side: Branding & Features (Hidden on mobile/tablet, visible on large desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 p-12 flex-col justify-between relative overflow-hidden h-screen sticky top-0">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8 animate-fade-in">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <ChefHat className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Aible</h1>
          </div>

          {/* Main Heading */}
          <div className="mb-12 animate-slide-in-left">
            <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
              Your AI-Powered<br />Kitchen Assistant
            </h2>
            <p className="text-green-50 text-xl leading-relaxed max-w-lg">
              Track your inventory, reduce food waste, and get personalized recipe suggestions powered by AI.
            </p>
          </div>

          {/* Features List */}
          <div className="space-y-6 animate-fade-in-up animation-delay-200">
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Smart Inventory Tracking</h3>
                <p className="text-green-100 text-sm">Scan barcodes and track expiry dates</p>
              </div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">AI Recipe Generation</h3>
                <p className="text-green-100 text-sm">Get personalized recipes instantly</p>
              </div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Auto Shopping Lists</h3>
                <p className="text-green-100 text-sm">Never forget ingredients again</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-green-100/80 text-sm font-medium animate-fade-in animation-delay-400">
          © 2026 Aible &bull; Making kitchens smarter
        </div>
      </div>

      {/* Right Side: Login Form (Full screen on mobile, half on desktop) */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-16 min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 relative">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="w-full max-w-md animate-fade-in-up relative z-10">
          {/* Mobile Logo (Visible only on mobile/tablet) */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl shadow-xl mb-4 hover:scale-105 hover:rotate-3 transition-transform duration-300">
              <ChefHat className="w-10 h-10 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-4xl font-bold text-emerald-900 mb-2">Aible</h1>
            <p className="text-emerald-600 text-lg font-medium text-center max-w-xs">
              Your AI-Powered Kitchen Assistant
            </p>
          </div>

          {/* Login Card - Glassmorphism */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-emerald-100 p-8 sm:p-10 hover:shadow-emerald-200/40 hover:shadow-3xl transition-all duration-500">
            {/* Welcome Text */}
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-emerald-950 mb-2">
                Welcome Back
              </h2>
              <p className="text-emerald-600 text-base">
                Sign in to continue to your kitchen dashboard
              </p>
            </div>

            {/* Sign In Button */}
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="group relative w-full flex items-center justify-center gap-3 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:shadow-emerald-500/20 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 focus:outline-none focus:ring-4 focus:ring-emerald-200 overflow-hidden cursor-pointer"
              aria-label="Sign in with Google"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <div className="bg-white p-1.5 rounded-full shadow-sm">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </div>
                  <span>Sign in with Google</span>
                </>
              )}
            </button>

            {/* Mobile Features (simplified for clarity) */}
            <div className="lg:hidden mt-8 pt-6 border-t border-emerald-100 space-y-3">
              <div className="flex items-center gap-3 text-emerald-700">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-sm font-medium">Track inventory & expiry dates</span>
              </div>
              <div className="flex items-center gap-3 text-emerald-700">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-sm font-medium">AI-powered recipe suggestions</span>
              </div>
              <div className="flex items-center gap-3 text-emerald-700">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-sm font-medium">Auto-generated shopping lists</span>
              </div>
            </div>

            {/* Footer Text */}
            <p className="text-center text-xs text-emerald-600/70 mt-8 font-medium">
              By signing in, you agree to our <a href="#" className="underline hover:text-emerald-700">Terms</a> and <a href="#" className="underline hover:text-emerald-700">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}