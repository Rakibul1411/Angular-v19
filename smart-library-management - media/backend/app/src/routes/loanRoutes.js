import express from 'express';
import {
  issueLoan,
  returnLoan,
  getUserLoans,
  getAllLoans,
  getOverdueLoans,
  extendLoan,
  getPopularBooks,
  getActiveUsers,
  getSystemOverview,
} from '../controllers/loanController.js';
import { 
  authenticateToken, 
  requireAdmin, 
  requireSelfOrAdmin 
} from '../middlewares/auth.js';

const router = express.Router();

// Admin-only routes
router.get('/allLoans', authenticateToken, requireAdmin, getAllLoans);
router.get('/overdueLoans', authenticateToken, requireAdmin, getOverdueLoans);
router.get('/books/popular', authenticateToken, requireAdmin, getPopularBooks);
router.get('/users/active', authenticateToken, requireAdmin, getActiveUsers);
router.get('/overview', authenticateToken, requireAdmin, getSystemOverview);

// Authenticated user routes
router.post('/issueLoan', authenticateToken, issueLoan);
router.post('/returnLoan', authenticateToken, returnLoan);

// Self or admin routes
router.get('/:user_id', authenticateToken, requireSelfOrAdmin('user_id'), getUserLoans);
router.put('/:id/extend', authenticateToken, extendLoan);

export default router;