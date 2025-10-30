import jwt from 'jsonwebtoken';


export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, user) => {
    if (err) {
      // Return 401 for expired/invalid tokens so frontend can refresh
      return res.status(401).json({ error: 'Invalid or expired access token' });
    }
    req.user = user;
    next();
  });
};



const ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin'
};



export const requireRole = (...allowedRoles) => {
  const roles = allowedRoles.flat();
  
  return (req, res, next) => {
    const currentUser = req.user;
    
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(currentUser.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles.length === 1 ? roles[0] : roles,
        current: currentUser.role
      });
    }

    next();
  };
};



export const requireSelfOrAdmin = (paramName = 'id') => {
  return (req, res, next) => {
    const currentUser = req.user;
    const resourceId = req.params[paramName];

    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const isOwner = String(currentUser.id) === String(resourceId);
    const isAdmin = currentUser.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        error: 'Not authorized to access this resource',
        message: 'You can only access your own resources unless you are an admin'
      });
    }

    next();
  };
};



export const requireOwnership = (ownershipCheckFn) => {
  return async (req, res, next) => {
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (currentUser.role === ROLES.ADMIN) {
      return next();
    }

    try {
      const isOwner = await ownershipCheckFn(req);
      
      if (!isOwner) {
        return res.status(403).json({ 
          error: 'Not authorized to access this resource' 
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ 
        error: 'Authorization check failed',
        details: error.message 
      });
    }
  };
};


export const requireAdmin = requireRole(ROLES.ADMIN);

export { ROLES };