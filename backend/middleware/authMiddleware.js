// Import jsonwebtoken to verify tokens sent by the client
const jwt = require('jsonwebtoken');

// Load JWT secret from environment, with a fallback value
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Verify JWT token
// Middleware to check if the request contains a valid JWT
exports.verifyToken = (req, res, next) => {
  // Read the Authorization header from the request
  const authHeader = req.headers.authorization;
  // Extract the token part after "Bearer "
  const token = authHeader && authHeader.split(' ')[1];

  // If no token is present, block the request
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, JWT_SECRET);
    // Attach decoded user data to the request object
    req.user = decoded;
    // Pass control to the next middleware or route handler
    next();
  } catch (error) {
    // If verification fails, respond with forbidden status
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

// Restrict access by role
// Middleware factory to allow only specific roles
exports.authorizeRoles = (...allowedRoles) => {
  // Return the actual middleware function
  return (req, res, next) => {
    // Check if user exists and their role is in the allowed list
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Access forbidden: Insufficient permissions.',
      });
    }
    // If role is allowed, continue to the next handler
    next();
  };
};