import express from 'express';
import {
  registerUser,
  getUserById,
  updateUser,
  deleteUser,
  findByRole,
  getAllUsersController,
  loginUserController,
  refreshTokenController,
  logoutController,
} from '../controllers/userController.js';
import { 
  authenticateToken, 
  requireSelfOrAdmin, 
  requireAdmin 
} from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUserController);
router.post('/refresh', refreshTokenController);
router.post('/logout', logoutController);

// Admin-only routes
router.get('/role', authenticateToken, requireAdmin, findByRole);
router.get('/all', authenticateToken, requireAdmin, getAllUsersController);
router.delete('/:id', authenticateToken, requireAdmin, deleteUser);

// Self or admin routes
router.get('/:id', authenticateToken, requireSelfOrAdmin(), getUserById);
router.put('/:id', authenticateToken, requireSelfOrAdmin(), updateUser);

export default router;