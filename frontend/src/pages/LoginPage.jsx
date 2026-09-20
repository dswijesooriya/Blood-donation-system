// Import useState hook for local state in the component
import { useState } from 'react';
// Import navigation hook and Link for routing
import { useNavigate, Link } from 'react-router-dom';
// Import useForm for form handling and validation
import { useForm } from 'react-hook-form';
// Import the configured axios instance for API calls
import api from '../api/axios';
// Import useAuth to access the login function
import { useAuth } from '../context/AuthContext';

// Login page component for donors, hospitals, and admins
const LoginPage = () => {
  // Set up form handling with react-hook-form
  const { register, handleSubmit, formState: { errors } } = useForm();
  // State: selected role (DONOR, HOSPITAL, or ADMIN)
  const [role, setRole] = useState('DONOR');
  // State: error message returned by the backend
  const [serverError, setServerError] = useState('');
  // State: whether the login request is in progress
  const [loading, setLoading] = useState(false);
  // State: whether to show the password as plain text
  const [showPassword, setShowPassword] = useState(false);
  // Hook to programmatically navigate after successful login
  const navigate = useNavigate();
  // Get the login function from auth context
  const { login } = useAuth();

  // Handle form submit: send login request to the backend
  const onSubmit = async (data) => {
    // Turn on loading spinner and clear previous errors
    setLoading(true);
    setServerError('');
    try {
      // POST credentials and role to the backend login endpoint
      const res = await api.post('/auth/login', { ...data, role });
      // Save user and token in AuthContext
      login(res.data.user, res.data.token);
      // Map each role to its dashboard path
      const redirectPath = {
  DONOR: '/donor/dashboard',
  HOSPITAL: '/hospital/dashboard',
  ADMIN: '/admin/dashboard',
}[role];
// Navigate to the role-specific dashboard
navigate(redirectPath);
    } catch (err) {
      // Show the backend's error message or a fallback
      setServerError(err.response?.data?.message || 'Login failed. Try again.');
    } finally {
      // Always turn off loading when done
      setLoading(false);
    }
  };

  return (
    // Full-screen centered layout for the login form
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {/* Logo linking back to the landing page */}
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <span className="text-3xl">🩸</span>
            <span className="text-2xl font-bold text-red-600">BloodLife</span>
          </Link>
          {/* Page title and subtitle */}
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome Back</h1>
          <p className="text-gray-500">Login to your account</p>
        </div>

        <div className="card">
          {/* Role toggle */}
          {/* Buttons to switch between DONOR, HOSPITAL, and ADMIN */}
          <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-lg mb-6">
  {['DONOR', 'HOSPITAL', 'ADMIN'].map((r) => (
    <button
      key={r}
      type="button"
      onClick={() => setRole(r)}
      className={`py-2 text-xs sm:text-sm font-semibold rounded-md transition ${
        role === r ? 'bg-white shadow text-red-600' : 'text-gray-600'
      }`}
    >
      {r === 'DONOR' ? '🩸 Donor' : r === 'HOSPITAL' ? '🏥 Hospital' : '🛡️ Admin'}
    </button>
  ))}
</div>

          {/* Login form wired to react-hook-form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              {/* Label changes based on selected role */}
              <label className="label-field">
                {role === 'DONOR' ? 'Email Address' : 'Email or Registration ID'}
              </label>
              <input
                type="text"
                // Register the identifier field with a required rule
                {...register('identifier', { required: 'This field is required' })}
                className="input-field"
               placeholder={
  role === 'DONOR'
    ? 'name@example.com'
    : role === 'HOSPITAL'
    ? 'email or HOSP-7890'
    : 'admin@bloodlife.com'
}
              />
              {/* Show validation error for the identifier field */}
              {errors.identifier && <p className="error-text">{errors.identifier.message}</p>}
            </div>

            <div>
              <label className="label-field">Password</label>
              <div className="relative">
                {/* Password input that toggles between text and password */}
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required' })}
                  className="input-field pr-12"
                  placeholder="Enter your password"
                />
                {/* Button to toggle password visibility */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {/* Show validation error for the password field */}
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>

            {/* Show server-side error only if it exists */}
            {serverError && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                {serverError}
              </div>
            )}

            {/* Submit button disabled while loading */}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Logging in...' : 'Login →'}
            </button>
          </form>

          {/* Link to donor registration for new users */}
          <div className="text-center mt-6 text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register/donor" className="text-red-600 font-semibold hover:underline">
              Register Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export LoginPage so it can be used in App.jsx
export default LoginPage;