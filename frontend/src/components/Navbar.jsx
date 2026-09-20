// Import React hooks for side effects, refs, and local state
import { useEffect, useRef, useState } from 'react';
// Import Link and useNavigate for navigation
import { Link, useNavigate } from 'react-router-dom';
// Import useAuth to access current user and logout function
import { useAuth } from '../context/AuthContext';

/**
 * Reusable Navbar
 * Props:
 *   - portalLabel: e.g. "Donor Dashboard" or "Hospital: Central"
 *   - menuItems: array of { to, label, icon }
 *   - unreadCount: (optional) number to show badge on bell
 */
// Reusable Navbar component used across donor and hospital pages
const Navbar = ({ portalLabel, menuItems = [], unreadCount = 0 }) => {
  // Get current user and logout function from auth context
  const { user, logout } = useAuth();
  // Hook to programmatically navigate between routes
  const navigate = useNavigate();
  // State to control whether the dropdown is open
  const [open, setOpen] = useState(false);
  // Ref pointing to the dropdown so we can detect outside clicks
  const dropdownRef = useRef(null);

  // Close on outside click
  // Add a global click listener to detect clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      // If click is outside the dropdown, close it
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    // Attach the listener to the document
    document.addEventListener('mousedown', handleClickOutside);
    // Cleanup the listener when the component unmounts
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle logout click: close dropdown, log out, go to login
  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/login');
  };

  // Check if the current user is a donor
  const isDonor = user?.role === 'DONOR';

  // Initials: "Dinesh Perera" → "DP"
  // Build avatar initials from the user's name
  const initials = (user?.name || 'U')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    // Sticky top navbar with white background
    <nav className="bg-white border-b border-gray-100 px-6 py-3 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Logo + Portal label */}
        <div className="flex items-center gap-3">
          {/* Logo links to the correct dashboard based on role */}
          <Link to={isDonor ? '/donor/dashboard' : '/hospital/dashboard'} className="flex items-center gap-2">
            <span className="text-2xl">🩸</span>
            <span className="text-xl font-bold text-red-600">BloodLife</span>
          </Link>
          {/* Show optional portal label next to the logo */}
          {portalLabel && (
            <span className="hidden md:inline text-sm text-gray-500 pl-3 border-l border-gray-200">
              {portalLabel}
            </span>
          )}
        </div>

        {/* Right: Bell + Profile dropdown */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          {/* Bell only visible for donors */}
          {isDonor && (
            <Link
              to="/donor/notifications"
              className="relative text-xl hover:scale-110 transition-transform"
              title="Notifications"
            >
              🔔
              {/* Show unread badge if count is greater than zero */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            {/* Button to toggle the dropdown open/closed */}
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-100 transition-colors"
            >
              {/* Show user's initials in a red circle */}
              <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center text-sm">
                {initials}
              </div>
              {/* Show user's first name on larger screens */}
              <span className="hidden md:inline text-sm font-semibold text-gray-700">
                {user?.name?.split(' ')[0]}
              </span>
              {/* Chevron icon rotates when the dropdown is open */}
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  open ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {/* Only render the dropdown when open is true */}
            {open && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-40 animate-fade-in">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-gray-100">
                  {/* Show the user's full name */}
                  <p className="font-semibold text-gray-900 truncate">
                    {user?.name}
                  </p>
                  {/* Show role-specific info like blood type or district */}
                  <p className="text-xs text-gray-500 truncate">
                    {isDonor
                      ? `🩸 ${user?.bloodType} • 📍 ${user?.district}`
                      : `🏥 ${user?.district}`}
                  </p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  {/* Loop through menuItems prop and render each link */}
                  {menuItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      {/* Show the item's icon emoji */}
                      <span className="text-base">{item.icon}</span>
                      {/* Show the item's label text */}
                      <span className="font-medium">{item.label}</span>
                      {/* Show optional badge count next to the item */}
                      {item.badge && item.badge > 0 && (
                        <span className="ml-auto bg-red-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>

                {/* Logout */}
                <div className="border-t border-gray-100 pt-1">
                  {/* Logout button at the bottom of the dropdown */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-semibold transition-colors"
                  >
                    <span className="text-base">🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Export Navbar so pages can import and use it
export default Navbar;