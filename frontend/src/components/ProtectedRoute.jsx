// Import Navigate for redirects and useLocation to read current URL
import { Navigate, useLocation } from 'react-router-dom';
// Import useAuth to access the current user and auth status
import { useAuth } from '../context/AuthContext';

// Wrapper component that protects routes based on auth and role
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  // Get the current user and auth loading flags from context
  const { user, loading, hydrated } = useAuth();
  // Get the current location so we can remember where the user was going
  const location = useLocation();

  // Show spinner until AuthContext finishes checking localStorage
  // Prevent flashing the login page before session is restored
  if (loading || !hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Verifying session...</p>
        </div>
      </div>
    );
  }

  // Not logged in → login page, remember where they wanted to go
  // Redirect unauthenticated users to the login page
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Wrong role → home
  // If the user's role is not in the allowed list, redirect home
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // User is authorized → render the protected page
  return children;
};

// Export the component so it can wrap routes in App.jsx
export default ProtectedRoute;