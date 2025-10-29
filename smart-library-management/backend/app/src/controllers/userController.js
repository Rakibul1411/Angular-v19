import { userService } from '../services/index.js';
import jwt from 'jsonwebtoken';

let refreshTokens = [];


export const registerUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);

    if (!user) {
      return res.status(409).json({
        error: 'Email already registered'
      });
    }

    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};


export const getUserById = async (req, res, next) => {
  try {
    const user = await userService.findUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const safeUser = user.toObject ? user.toObject() : { ...user };
    if (safeUser.password) delete safeUser.password;

    res.status(200).json(safeUser);
  } catch (err) {
    next(err);
  }
};


export const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUserById(req.params.id, req.body);

    if (user === null) {
      return res.status(409).json({
        error: 'Email already registered'
      });
    }

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    res.status(200).json({
      data: user,
    });
  } catch (err) {
    next(err);
  }
};


// Find users by role (query parameter: role=student or role=admin)
export const findByRole = async (req, res, next) => {
  try {
    const { role } = req.query;

    if (!role || !['admin', 'student'].includes(role)) {
      return res.status(400).json({
        error: 'Invalid or missing role. Use role=admin or role=student'
      });
    }

    const users = await userService.findUsersByRole(role);

    res.status(200).json({
      data: users,
      count: users.length
    });
  } catch (err) {
    next(err);
  }
};


export const getAllUsersController = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();

    res.status(200).json({
      data: users,
      count: users.length
    });
  } catch (err) {
    next(err);
  }
};


export const loginUserController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    const user = await userService.loginUser(email, password);

    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
    );
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );

    refreshTokens.push(refreshToken);

    res.status(200).json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    next(err);
  }
};


export const refreshTokenController = async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }
  
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ error: 'Invalid refresh token' });
  }

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    try {
      const user = await userService.findUserById(decoded.id);
      
      if (!user) {
        refreshTokens = refreshTokens.filter(token => token !== refreshToken);
        return res.status(404).json({ error: 'User not found' });
      }

      // Generate new access token
      const newAccessToken = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
      );

      // Generate new refresh token
      const newRefreshToken = jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
      );

      // Replace old refresh token with new one
      refreshTokens = refreshTokens.filter(token => token !== refreshToken);
      refreshTokens.push(newRefreshToken);

      res.json({ 
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: { 
          id: user._id, 
          name: user.name, 
          email: user.email, 
          role: user.role 
        }
      });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to refresh token' });
    }
  });
};


export const logoutController = (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({ 
      error: 'Refresh token is required' 
    });
  }

  if (!refreshTokens.includes(refreshToken)) {
    return res.status(400).json({ 
      error: 'Invalid refresh token' 
    });
  }

  refreshTokens = refreshTokens.filter(token => token !== refreshToken);
  res.status(200).json({ 
    message: 'Logged out successfully' 
  });
};


export const deleteUser = async (req, res, next) => {
  try {
    const user = await userService.deleteUserById(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.status(200).json({
      message: 'User deleted successfully',
      deletedUser: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    next(err);
  }
};