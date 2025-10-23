import express from 'express';
import {
  addBook,
  getBooks,
  getAllBooksController,
  getBookById,
  updateBook,
  deleteBook,
} from '../controllers/bookController.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';

const router = express.Router();

router.post('/addBook', authenticateToken, requireRole('admin'), addBook);
router.get('/getBooks', authenticateToken, getBooks);
router.get('/all', authenticateToken, getAllBooksController);
router.get('/:id', authenticateToken, getBookById);
router.put('/:id', authenticateToken, requireRole('admin'), updateBook);
router.delete('/:id', authenticateToken, requireRole('admin'), deleteBook);

export default router;