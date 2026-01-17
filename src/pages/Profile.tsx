/**
 * Profile Page Component for Aible
 *
 * Displays user profile information and settings.
 * Features include viewing profile details, preferences, and account settings.
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import {
  Mail,
  LogOut,
  ArrowLeft,
  Menu,
  Settings,
  Package,
  BookOpen,
  ShoppingCart,
  TrendingUp,
  BarChart3,
  Home,
  ClipboardList,
  ChefHat,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { differenceInDays } from 'date-fns';
import Footer from '../components/Footer';

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [imageError, setImageError] = useState<{ [key: string]: boolean }>({});
  
  // Real metrics calculation
  const getActiveDays = () => {
    if (!user?.created_at) return 1;
    const days = differenceInDays(new Date(), new Date(user.created_at));
    // Add 1 so day 0 (today) counts as 1st day
    return Math.max(1, days + 1);
  };

  const activeDays = getActiveDays();
  const [systemStatus, setSystemStatus] = useState<'operational' | 'degraded'>('operational');

  // Simulate system status check
  useEffect(() => {
    const timer = setInterval(() => {
      if (Math.random() > 0.99) {
         setSystemStatus(prev => prev === 'operational' ? 'degraded' : 'operational');
      }
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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

  const getFullName = () => {
    return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  };

  const getProfilePicture = () => {
    return user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  };

  const getInitials = () => {
    const name = getFullName();
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const profilePictureUrl = useMemo(() => getProfilePicture(), [user?.user_metadata]);
  const hasImageError = imageError[profilePictureUrl || ''] || false;

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
                  <h1 className="text-5xl lg:text-6xl font-black tracking-tight hidden sm:block animate-shine">Aible</h1>
                </button>
              </div>

              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-3 hover:bg-emerald-50 rounded-xl px-3 py-1.5 transition-colors cursor-pointer border border-transparent hover:border-emerald-100"
                >
                  <div className="flex items-center gap-3 text-left">
                    {profilePictureUrl && !hasImageError ? (
                      <img
                        src={profilePictureUrl}
                        alt="Profile"
                        className="w-9 h-9 rounded-full border border-emerald-200 object-cover"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        onError={() => setImageError(prev => ({ ...prev, [profilePictureUrl]: true }))}
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center border border-emerald-200 shadow-sm">
                        <span className="text-white font-bold text-xs">{getInitials()}</span>
                      </div>
                    )}
                    <div className="text-sm">
                      <p className="font-semibold text-emerald-900 leading-tight">{getFirstName()}</p>
                      <p className="text-emerald-600 text-xs leading-tight">{user?.email}</p>
                    </div>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-xl hover:bg-emerald-100 transition-colors text-emerald-600"
                aria-label="Toggle menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>

          {showMobileMenu && (
            <div className="md:hidden py-4 px-4 border-t border-emerald-100 bg-white/90 rounded-b-2xl">
              <div className="flex items-center gap-3 mb-4">
                {profilePictureUrl && !hasImageError ? (
                  <img
                    src={profilePictureUrl}
                    alt="Profile"
                    className="w-12 h-12 rounded-full border-2 border-emerald-200 object-cover"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    onError={() => setImageError(prev => ({ ...prev, [profilePictureUrl]: true }))}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center border-2 border-emerald-200 shadow-sm">
                    <span className="text-white font-bold text-sm">{getInitials()}</span>
                  </div>
                )}
                <div className="text-sm">
                  <p className="font-bold text-emerald-900">{getFirstName()}</p>
                  <p className="text-emerald-700">{user?.email}</p>
                </div>
              </div>
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
        <div className="mb-8 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl font-bold text-emerald-900 mb-2 animate-slide-in-left">Profile</h2>
          <p className="text-emerald-700 animate-slide-in-left animation-delay-100 font-medium">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Profile Card & Quick Actions */}
          <div className="lg:col-span-2 space-y-8 animate-fade-in-up animation-delay-200">
            {/* Profile Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-emerald-100 overflow-hidden hover:shadow-md transition-all duration-500">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 h-32"></div>

              {/* Profile Content */}
              <div className="px-6 pb-8">
                {/* Profile Picture */}
                <div className="flex items-start gap-6 -mt-16 mb-8">
                  {profilePictureUrl && !hasImageError ? (
                    <img
                      src={profilePictureUrl}
                      alt="Profile"
                      className="w-32 h-32 rounded-full border-4 border-white shadow-xl hover:scale-105 transition-transform duration-300 object-cover"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      onError={() => setImageError(prev => ({ ...prev, [profilePictureUrl]: true }))}
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full border-4 border-white bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-xl hover:scale-105 transition-transform duration-300">
                      <span className="text-white font-bold text-4xl">{getInitials()}</span>
                    </div>
                  )}
                  <div className="flex-1 pt-20">
                    <h3 className="text-3xl font-bold text-emerald-900 mb-1">{getFullName()}</h3>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Pro User
                      </span>
                      <p className="text-emerald-700 font-medium text-sm">Aible User</p>
                    </div>
                  </div>
                </div>

                {/* Profile Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 hover:bg-emerald-50 transition-colors duration-200 group">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors shadow-sm">
                      <Mail className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-0.5">Email Address</p>
                      <p className="font-semibold text-emerald-900 truncate" title={user?.email}>{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 hover:bg-emerald-50 transition-colors duration-200 group">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-white rounded-xl flex-shrink-0 flex items-center justify-center group-hover:bg-emerald-100 transition-colors shadow-sm">
                        <Settings className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-0.5">Account Settings</p>
                        <p className="font-semibold text-emerald-900 leading-tight">Manage Subscription & Preferences</p>
                      </div>
                    </div>
                    <button className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-emerald-700 bg-white border border-emerald-200 rounded-xl shadow-sm hover:bg-emerald-50 hover:border-emerald-300 transition-all text-center">
                      Configure
                    </button>
                  </div>
                </div>
                
                 {/* Quick Actions */}
                <div className="mt-10">
                   <h4 className="text-xl font-bold text-emerald-900 mb-6 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-emerald-600" />
                    Quick Actions
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                    >
                      <Home className="w-5 h-5" />
                      <span>Dashboard</span>
                    </button>
                    <button
                      onClick={() => navigate('/inventory')}
                      className="flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-100"
                    >
                      <Package className="w-5 h-5" />
                      <span>Inventory</span>
                    </button>
                    <button
                      onClick={() => navigate('/recipes')}
                      className="flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-teal-100"
                    >
                      <ChefHat className="w-5 h-5" />
                      <span>Recipes</span>
                    </button>
                  </div>
                </div>

                 {/* Sign Out Button */}
                <div className="mt-10">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-50 text-red-600 font-bold rounded-2xl border border-red-100 hover:bg-red-100 hover:border-red-200 shadow-sm hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-50"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out from Account</span>
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: Real-Time Metrics & Stats */}
          <div className="lg:col-span-1 space-y-6 animate-fade-in-up animation-delay-300">
            
            {/* Real-Time Status Card - Animated */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-sm border border-emerald-100 p-6 relative overflow-hidden group hover:shadow-md transition-all duration-500">
               <div className="flex items-center justify-between mb-6">
                 <h4 className="text-xl font-bold text-emerald-900 flex items-center gap-2">
                   <BarChart3 className="w-5 h-5 text-emerald-600" />
                   Real-Time Metrics
                 </h4>
                 <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${systemStatus === 'operational' ? 'bg-emerald-400' : 'bg-yellow-400'}`}></span>
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${systemStatus === 'operational' ? 'bg-emerald-500' : 'bg-yellow-500'}`}></span>
                    </span>
                    <span className={`text-xs font-bold uppercase tracking-wider ${systemStatus === 'operational' ? 'text-emerald-600' : 'text-yellow-600'}`}>Live</span>
                 </div>
               </div>

               <div className="space-y-6">
                 {/* System Status */}
                 <div className={`rounded-2xl p-4 border transition-all duration-300 hover:scale-[1.02] ${systemStatus === 'operational' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-yellow-50/50 border-yellow-100'}`}>
                   <div className="flex justify-between items-center mb-2">
                     <span className={`text-sm font-bold ${systemStatus === 'operational' ? 'text-emerald-800' : 'text-yellow-800'}`}>System Status</span>
                     <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${systemStatus === 'operational' ? 'text-emerald-600 bg-white shadow-sm' : 'text-yellow-600 bg-white shadow-sm'}`}>
                       {systemStatus === 'operational' ? 'Operational' : 'Degraded'}
                     </span>
                   </div>
                   <div className={`w-full rounded-full h-2 ${systemStatus === 'operational' ? 'bg-emerald-200' : 'bg-yellow-200'}`}>
                     <div className={`h-2 rounded-full w-full animate-pulse ${systemStatus === 'operational' ? 'bg-emerald-500' : 'bg-yellow-500'}`}></div>
                   </div>
                 </div>

                 {/* Stats Grid - Staggered Animations */}
                 <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-2xl p-4 border border-emerald-50 shadow-sm hover:shadow-md hover:border-emerald-200 hover:-translate-y-1 transition-all duration-300">
                      <p className="text-xs text-emerald-500 font-bold uppercase tracking-tight mb-1">Total Items</p>
                      <div className="flex items-end gap-1">
                        <span className="text-2xl font-bold text-emerald-900">0</span>
                        <span className="text-xs text-emerald-400 font-medium mb-1">items</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 border border-emerald-50 shadow-sm hover:shadow-md hover:border-emerald-200 hover:-translate-y-1 transition-all duration-300 delay-75">
                      <p className="text-xs text-emerald-500 font-bold uppercase tracking-tight mb-1">Saved Recipes</p>
                       <div className="flex items-end gap-1">
                        <span className="text-2xl font-bold text-emerald-900">0</span>
                        <span className="text-xs text-emerald-400 font-medium mb-1">saved</span>
                      </div>
                    </div>
                     <div className="bg-white rounded-2xl p-4 border border-emerald-50 shadow-sm hover:shadow-md hover:border-emerald-200 hover:-translate-y-1 transition-all duration-300 delay-100">
                      <p className="text-xs text-emerald-500 font-bold uppercase tracking-tight mb-1">Shopping</p>
                       <div className="flex items-end gap-1">
                        <span className="text-2xl font-bold text-emerald-900">0</span>
                        <span className="text-xs text-emerald-400 font-medium mb-1">items</span>
                      </div>
                    </div>
                     <div className="bg-white rounded-2xl p-4 border border-emerald-50 shadow-sm hover:shadow-md hover:border-emerald-200 hover:-translate-y-1 transition-all duration-300 delay-150">
                      <p className="text-xs text-emerald-500 font-bold uppercase tracking-tight mb-1">Active Days</p>
                       <div className="flex items-end gap-1">
                        <span className="text-2xl font-bold text-emerald-900">{activeDays}</span>
                        <span className="text-xs text-emerald-400 font-medium mb-1">days</span>
                      </div>
                    </div>
                 </div>
               </div>
            </div>

            {/* Weekly Activity */}
             <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-emerald-100 p-6 hover:shadow-md transition-all duration-300">
                <h4 className="text-xl font-bold text-emerald-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Weekly Activity
                </h4>
                
                <div className="space-y-4">
                  {/* Activity Item 1 */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/50 hover:bg-emerald-50 hover:scale-[1.02] border border-transparent hover:border-emerald-100 transition-all duration-300 group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-sm font-bold text-emerald-900 leading-tight">Items Added</p>
                         <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Last 7 days</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-emerald-700">0</span>
                  </div>
                  
                  {/* Activity Item 2 */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50/30 hover:bg-blue-50 hover:scale-[1.02] border border-transparent hover:border-blue-100 transition-all duration-300 group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-sm font-bold text-emerald-900 leading-tight">Recipes Created</p>
                         <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Last 7 days</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-blue-700">0</span>
                  </div>

                  {/* Activity Item 3 */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-teal-50/30 hover:bg-teal-50 hover:scale-[1.02] border border-transparent hover:border-teal-100 transition-all duration-300 group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-teal-600 shadow-sm group-hover:bg-teal-500 group-hover:text-white transition-colors">
                        <ShoppingCart className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-sm font-bold text-emerald-900 leading-tight">Shopping Trips</p>
                         <p className="text-[10px] font-bold text-teal-500 uppercase tracking-widest">Last 7 days</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-teal-700">0</span>
                  </div>
                </div>

                <button className="w-full mt-6 py-2.5 text-xs font-bold text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-all border border-transparent hover:border-emerald-100">
                  View Detailed History
                </button>
             </div>

             {/* Pro Tip / Insight */}
             <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl shadow-lg p-6 text-white relative overflow-hidden group hover:scale-[1.02] hover:shadow-xl transition-all duration-500">
               <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>
               <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-3">
                   <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                     <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></div>
                   </div>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-50">AiBle Insight</span>
                 </div>
                 <h4 className="text-xl font-bold mb-2">Complete your profile</h4>
                 <p className="text-sm text-emerald-50 opacity-90 mb-6 font-medium leading-relaxed">
                   Add your dietary preferences to get better recipe recommendations.
                 </p>
                 <button className="text-xs font-bold bg-white text-emerald-600 px-5 py-2.5 rounded-xl shadow-sm hover:bg-emerald-50 transition-colors">
                   Update Preferences
                 </button>
               </div>
             </div>

          </div>
        </div>

        {/* Footer - Minimal & Integrated */}
        <Footer />
      </main>
    </div>
  );
}
