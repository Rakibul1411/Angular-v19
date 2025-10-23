import express from 'express';
import {
  issueBook,
  returnBook,
  getUserLoans,
  getOverdueLoans,
  extendLoan,
  getPopularBooks,
  getActiveUsers,
  getSystemOverview,
} from '../controllers/loanController.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', authenticateToken, issueBook);
router.post('/returns', authenticateToken, returnBook);
router.get('/overdue', authenticateToken, requireRole('admin'), getOverdueLoans);

router.get('/books/popular', authenticateToken, requireRole('admin'), getPopularBooks);
router.get('/users/active', authenticateToken, requireRole('admin'), getActiveUsers);
router.get('/overview', authenticateToken, requireRole('admin'), getSystemOverview);

router.get('/:user_id', authenticateToken, getUserLoans);
router.put('/:id/extend', authenticateToken, extendLoan);

export default router;
