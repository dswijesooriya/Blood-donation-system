// Import router components to define navigation in the app
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// Import AuthProvider and useAuth hook for authentication state
import { AuthProvider, useAuth } from './context/AuthContext';
// Import ProtectedRoute component to guard private pages
import ProtectedRoute from './components/ProtectedRoute';

// Import all public and private page components
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DonorRegister from './pages/DonorRegister';
import HospitalRegister from './pages/HospitalRegister';
import DonorDashboard from './pages/DonorDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import NotificationsPage from './pages/NotificationsPage';
import DonorProfile from './pages/DonorProfile';
import HospitalDonorDirectory from './pages/HospitalDonorDirectory';
import MyResponses from './pages/MyResponses';
import AdminDashboard from './pages/AdminDashboard';
import DonationHistory from './pages/DonationHistory';

// Wrapper that delays rendering until auth is hydrated
// Component that defines all routes for the application
const AppRoutes = () => {
  // Get loading and hydrated flags from the auth context
  const { loading, hydrated } = useAuth();

  // Show a loading spinner until the session is restored
  if (loading || !hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-5xl mb-4">🩸</div>
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Render all app routes once auth is ready
  return (
    <Routes>
      {/* Public routes: accessible to everyone */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register/donor" element={<DonorRegister />} />
      <Route path="/register/hospital" element={<HospitalRegister />} />

      {/* Donor routes */}
      {/* Donor dashboard: only accessible to logged-in donors */}
      <Route
        path="/donor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['DONOR']}>
            <DonorDashboard />
          </ProtectedRoute>
        }
      />
      {/* Donor notifications: only accessible to logged-in donors */}
      <Route
        path="/donor/notifications"
        element={
          <ProtectedRoute allowedRoles={['DONOR']}>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      {/* Donor profile: only accessible to logged-in donors */}
      <Route
        path="/donor/profile"
        element={
          <ProtectedRoute allowedRoles={['DONOR']}>
            <DonorProfile />
          </ProtectedRoute>
        }
      />

      {/* Donor responses: only accessible to logged-in donors */}
      <Route
  path="/donor/responses"
  element={
    <ProtectedRoute allowedRoles={['DONOR']}>
      <MyResponses />
    </ProtectedRoute>
  }
/>

      {/* Hospital routes */}
      {/* Hospital dashboard: only accessible to logged-in hospitals */}
      <Route
        path="/hospital/dashboard"
        element={
          <ProtectedRoute allowedRoles={['HOSPITAL']}>
            <HospitalDashboard />
          </ProtectedRoute>
        }
      />
      {/* Admin routes */}
{/* Admin dashboard: only accessible to logged-in admins */}
<Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>

      {/* Catch-all: redirect any unknown URL to the home page */}
      <Route path="*" element={<Navigate to="/" replace />} />
      {/* Hospital donor directory: only accessible to logged-in hospitals */}
      <Route
  path="/hospital/donors"
  element={
    <ProtectedRoute allowedRoles={['HOSPITAL']}>
      <HospitalDonorDirectory />
    </ProtectedRoute>
  }
/>
  <Route
  path="/donor/donations"
  element={
    <ProtectedRoute allowedRoles={['DONOR']}>
      <DonationHistory />
    </ProtectedRoute>
  }
/>

    </Routes>
  );
};

// Main App component that sets up router and auth provider
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

// Export App so it can be rendered in main.jsx
export default App;