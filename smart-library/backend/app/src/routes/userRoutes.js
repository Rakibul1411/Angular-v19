import express from 'express';
import {
  registerUser,
  getUser,
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
router.get('/', authenticateToken, findByRole);
router.get('/all', authenticateToken, getAllUsersController);
router.get('/:id', getUser);
router.put('/:id', authenticateToken, updateUser);

export default router;