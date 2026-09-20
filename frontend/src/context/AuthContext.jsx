// Import React hooks needed to create and manage context state
import { createContext, useContext, useState, useEffect } from 'react';

// Create the AuthContext object to share auth data globally
const AuthContext = createContext();

// Custom hook to access the AuthContext from any component
export const useAuth = () => {
  // Get the context value from the nearest AuthProvider
  const context = useContext(AuthContext);
  // Throw an error if used outside the provider (developer mistake)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  // Return the context so components can use user/token/login/logout
  return context;
};

// AuthProvider component wraps the whole app and manages auth state
export const AuthProvider = ({ children }) => {
  // Store the logged-in user object (null if not logged in)
  const [user, setUser] = useState(null);
  // Store the JWT token (null if not logged in)
  const [token, setToken] = useState(null);
  // Track whether the initial session check is still running
  const [loading, setLoading] = useState(true);
  // Track whether the session has been restored from storage
  const [hydrated, setHydrated] = useState(false);

  // Restore session from sessionStorage (per-tab)
  // Runs once when the app first mounts
  useEffect(() => {
    try {
      // Read saved token and user from sessionStorage
      const savedToken = sessionStorage.getItem('token');
      const savedUser = sessionStorage.getItem('user');

      // If both exist, restore them into state
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (err) {
      // Log the error and clear corrupted session data
      console.error('Failed to restore session:', err);
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    } finally {
      // Mark loading as done and hydration complete
      setLoading(false);
      setHydrated(true);
    }
  }, []);

  // Function to log a user in and save their session
  const login = (userData, jwtToken) => {
    // Save user and token in React state
    setUser(userData);
    setToken(jwtToken);
    // Persist user and token in sessionStorage for page refreshes
    sessionStorage.setItem('token', jwtToken);
    sessionStorage.setItem('user', JSON.stringify(userData));
    // Mark session as hydrated since user is now logged in
    setHydrated(true);
  };

  // Function to log the current user out
  const logout = () => {
    // Clear user and token from React state
    setUser(null);
    setToken(null);
    // Remove user and token from sessionStorage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  };

  // Provide auth state and functions to all children components
  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, hydrated }}>
      {children}
    </AuthContext.Provider>
  );
};