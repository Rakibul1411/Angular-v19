import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired access token' });
    req.user = user; // Attach user info to request
    next();
  });
};

// role can be a string or array of allowed roles
export const requireRole = (role) => {
  return (req, res, next) => {
    const currentUser = req.user;
    if (!currentUser) return res.status(401).json({ error: 'Authentication required' });

    const allowed = Array.isArray(role) ? role : [role];
    if (!allowed.includes(currentUser.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};