// routes/brandRoutes.js
import express from 'express';
import {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  deleteBrand
} from '../controllers/brandController.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Admin-only routes
router.post('/createBrand', authenticateToken, requireAdmin, createBrand);
router.put('/:id', authenticateToken, requireAdmin, updateBrand);
router.delete('/:id', authenticateToken, requireAdmin, deleteBrand);

// Authenticated user routes
router.get('/allBrands', authenticateToken, getAllBrands);
router.get('/:id', authenticateToken, getBrandById);

export default router;
