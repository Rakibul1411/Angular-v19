import express from 'express';
import {
  registerUser,
  getUserById,
  updateUser,
  findByRole,
  getAllUsersController,
  loginUserController,
  refreshTokenController,
  logoutController,
} from '../controllers/userController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUserController);
router.post('/refresh', refreshTokenController);
router.post('/logout', logoutController);
router.get('/role', authenticateToken, findByRole);
router.get('/all', authenticateToken, getAllUsersController);
router.get('/:id', authenticateToken, getUserById);
router.put('/:id', authenticateToken, updateUser);

export default router;