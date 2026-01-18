/**
 * AuthDemo Component
 *
 * Demonstrates how to use the authentication context in a React component.
 * This is a simple example showing:
 * - Sign in with Google
 * - Display user information
 * - Sign out
 * - Loading states
 *
 * You can use this as a reference or starter template for your own components.
 */

import { useAuth } from "../../lib/auth";

function AuthDemo() {
  const { user, session, loading, signInWithGoogle, signOut } = useAuth();

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // NOT AUTHENTICATED STATE
  // ============================================================================

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 m-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Aible
            </h1>
            <p className="text-gray-600">
              Sign in to access your personalized dashboard
            </p>
          </div>

          {/* Sign In Button */}
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 group"
          >
            {/* Google Logo */}
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>

            <span className="text-gray-700 font-medium group-hover:text-gray-900">
              Continue with Google
            </span>
          </button>

          {/* Footer */}
          <p className="text-xs text-gray-500 text-center mt-6">
            By signing in, you agree to our{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // AUTHENTICATED STATE
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* User Avatar */}
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="User avatar"
                  className="w-16 h-16 rounded-full border-2 border-blue-500"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                  {user.email?.[0].toUpperCase()}
                </div>
              )}

              {/* User Info */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back!
                </h1>
                <p className="text-gray-600">
                  {user.user_metadata?.full_name || user.email}
                </p>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={signOut}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* User Details Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Profile Information
          </h2>

          <div className="space-y-3">
            <div className="flex border-b pb-3">
              <span className="font-semibold text-gray-700 w-32">Email:</span>
              <span className="text-gray-600">{user.email}</span>
            </div>

            <div className="flex border-b pb-3">
              <span className="font-semibold text-gray-700 w-32">Name:</span>
              <span className="text-gray-600">
                {user.user_metadata?.full_name || "Not provided"}
              </span>
            </div>

            <div className="flex border-b pb-3">
              <span className="font-semibold text-gray-700 w-32">User ID:</span>
              <span className="text-gray-600 font-mono text-sm">
                {user.id}
              </span>
            </div>

            <div className="flex border-b pb-3">
              <span className="font-semibold text-gray-700 w-32">Provider:</span>
              <span className="text-gray-600 capitalize">
                {user.app_metadata?.provider || "Unknown"}
              </span>
            </div>

            <div className="flex">
              <span className="font-semibold text-gray-700 w-32">
                Last Sign In:
              </span>
              <span className="text-gray-600">
                {user.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleString()
                  : "Unknown"}
              </span>
            </div>
          </div>
        </div>

        {/* Session Details Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Session Information
          </h2>

          <div className="space-y-3">
            <div className="flex border-b pb-3">
              <span className="font-semibold text-gray-700 w-32">Status:</span>
              <span className="inline-flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-green-600 font-medium">Active</span>
              </span>
            </div>

            <div className="flex border-b pb-3">
              <span className="font-semibold text-gray-700 w-32">
                Access Token:
              </span>
              <span className="text-gray-600 font-mono text-xs truncate max-w-md">
                {session?.access_token
                  ? `${session.access_token.substring(0, 30)}...`
                  : "Not available"}
              </span>
            </div>

            <div className="flex">
              <span className="font-semibold text-gray-700 w-32">
                Expires At:
              </span>
              <span className="text-gray-600">
                {session?.expires_at
                  ? new Date(session.expires_at * 1000).toLocaleString()
                  : "Unknown"}
              </span>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Your session will automatically refresh
              before it expires. If you close the browser, you'll remain signed
              in thanks to session persistence.
            </p>
          </div>
        </div>

        {/* Developer Info */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">
            For Developers:
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            This component demonstrates the useAuth() hook. You can access:
          </p>
          <ul className="text-sm text-gray-600 space-y-1 ml-4">
            <li>
              <code className="bg-gray-200 px-2 py-1 rounded">user</code> -
              User object with profile data
            </li>
            <li>
              <code className="bg-gray-200 px-2 py-1 rounded">session</code> -
              Session with access tokens
            </li>
            <li>
              <code className="bg-gray-200 px-2 py-1 rounded">loading</code> -
              Authentication loading state
            </li>
            <li>
              <code className="bg-gray-200 px-2 py-1 rounded">
                signInWithGoogle()
              </code>{" "}
              - Sign in function
            </li>
            <li>
              <code className="bg-gray-200 px-2 py-1 rounded">signOut()</code>{" "}
              - Sign out function
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AuthDemo;
