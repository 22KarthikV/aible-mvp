/**
 * ProtectedRoute Component for Aible
 *
 * A wrapper component that protects routes from unauthorized access.
 * Checks authentication status and redirects to login if user is not authenticated.
 * Shows a loading spinner while checking auth state.
 *
 * Usage:
 * <Route element={<ProtectedRoute />}>
 *   <Route path="/dashboard" element={<Dashboard />} />
 * </Route>
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If user is authenticated, render the protected component
  return <Outlet />;
}
