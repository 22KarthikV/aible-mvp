/**
 * Main App Component for Aible
 *
 * Sets up React Router v6 with protected routes and authentication flow.
 * Handles routing between Login and protected pages (Dashboard, Inventory, Recipes, Shopping List, Profile).
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './lib/auth';
import { ProtectedRoute } from './components/auth';
import { ScrollToTop } from './components/shared';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Recipes from './pages/Recipes';
import ShoppingList from './pages/ShoppingList';
import Profile from './pages/Profile';

/**
 * LoginRedirect Component
 * Redirects to dashboard if user is already authenticated
 * Otherwise shows the Login page
 */
function LoginRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Let the router handle loading state
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Login />;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public route - redirects to dashboard if authenticated */}
        <Route path="/" element={<LoginRedirect />} />

        {/* Protected routes - requires authentication */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/shopping-list" element={<ShoppingList />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Catch-all route - redirects to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
