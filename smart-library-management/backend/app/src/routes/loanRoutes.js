import express from 'express';
import {
  issueBook,
  returnBook,
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
router.get('/all', authenticateToken, requireAdmin, getAllLoans);
router.get('/overdue', authenticateToken, requireAdmin, getOverdueLoans);
router.get('/books/popular', authenticateToken, requireAdmin, getPopularBooks);
router.get('/users/active', authenticateToken, requireAdmin, getActiveUsers);
router.get('/overview', authenticateToken, requireAdmin, getSystemOverview);

// Authenticated user routes
router.post('/issueBook', authenticateToken, issueBook);
router.post('/returns', authenticateToken, returnBook);

// Self or admin routes
router.get('/:user_id', authenticateToken, requireSelfOrAdmin('user_id'), getUserLoans);
router.put('/:id/extend', authenticateToken, extendLoan);

export default router;