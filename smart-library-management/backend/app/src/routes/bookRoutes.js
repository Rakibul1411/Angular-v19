import express from 'express';
import {
  addBook,
  getBooks,
  getAllBooksController,
  getBookById,
  updateBook,
  deleteBook,
} from '../controllers/bookController.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Admin-only routes
router.post('/addBook', authenticateToken, requireAdmin, addBook);
router.put('/:id', authenticateToken, requireAdmin, updateBook);
router.delete('/:id', authenticateToken, requireAdmin, deleteBook);

// Authenticated user routes
router.get('/getBooks', authenticateToken, getBooks);
router.get('/all', authenticateToken, getAllBooksController);
router.get('/:id', authenticateToken, getBookById);

export default router;