import { userService } from '../services/index.js';
import jwt from 'jsonwebtoken';

// In-memory store for refresh tokens (replace with DB for production)
let refreshTokens = [];

// Register a new user
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


// Get user by ID
export const getUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (currentUser.id !== userId && currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view this user' });
    }

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


// Update user profile
export const updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;  // ID from URL
    const currentUser = req.user;  // From JWT (e.g., { id: '123', role: 'student' })

    // Authorization: Allow only the user themselves or an admin to update
    if (currentUser.id !== userId && currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this user' });
    }

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

// Find users by role (query parameter: role=student or role=faculty)
export const findByRole = async (req, res, next) => {
  try {

    const currentUser = req.user;  // From JWT

    // Authorization: Allow only admins to view all users
    if (currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can view all users' });
    }

    const { role } = req.query;

    if (!role || !['admin', 'student', 'teacher'].includes(role)) {
      return res.status(400).json({
        error: 'Invalid or missing role. Use role=admin, role=student, or role=teacher'
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

// Get all users
export const getAllUsersController = async (req, res, next) => {
  try {
    const currentUser = req.user;

    if (currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can view all users' });
    }

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


export const refreshTokenController = (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });
  if (!refreshTokens.includes(refreshToken)) return res.status(403).json({ error: 'Invalid refresh token' });

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid refresh token' });

    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
    );

    res.json({ accessToken: newAccessToken });
  });
};


export const logoutController = (req, res) => {
  const { refreshToken } = req.body;
  refreshTokens = refreshTokens.filter(token => token !== refreshToken);
  res.status(200).json({ message: 'Logged out successfully' });
};