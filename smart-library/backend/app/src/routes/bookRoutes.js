import express from 'express';
import {
  addBook,
  getBooks,
  getAllBooksController,
  getBookById,
  updateBook,
  deleteBook,
} from '../controllers/bookController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', authenticateToken, addBook);
router.get('/', authenticateToken, getBooks);
router.get('/all', authenticateToken, getAllBooksController);
router.get('/:id', authenticateToken, getBookById);
router.put('/:id', authenticateToken, updateBook);
router.delete('/:id', authenticateToken, deleteBook);

export default router;