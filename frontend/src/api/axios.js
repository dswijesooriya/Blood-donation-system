// Import axios to make HTTP requests to the backend
import axios from 'axios';

// Create a custom axios instance with a base URL and default headers
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from sessionStorage to every request
// Request interceptor runs before every API call is sent
api.interceptors.request.use(
  (config) => {
    // Retrieve the saved JWT token from sessionStorage
    const token = sessionStorage.getItem('token');
    // If a token exists, attach it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Return the modified config so the request can proceed
    return config;
  },
  // Pass any request errors down the chain
  (error) => Promise.reject(error)
);

// Handle 401/403 errors globally
// Response interceptor runs after every API response is received
api.interceptors.response.use(
  // Pass successful responses straight through
  (response) => response,
  (error) => {
    // If the token is invalid or forbidden, log the user out
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Get the current page path to avoid redirect loops
      const currentPath = window.location.pathname;
      // Only redirect if the user isn't already on a public page
      if (currentPath !== '/login' && currentPath !== '/') {
        // Clear stored auth data from sessionStorage
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        // Redirect the user to the login page
        window.location.href = '/login';
      }
    }
    // Reject the promise so the calling code can handle it
    return Promise.reject(error);
  }
);

// Export the configured axios instance for use across the app
export default api;