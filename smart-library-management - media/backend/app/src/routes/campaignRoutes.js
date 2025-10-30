// routes/campaignRoutes.js
import express from 'express';
import {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign
} from '../controllers/campaignController.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Admin-only routes
router.post('/createCampaign', authenticateToken, requireAdmin, createCampaign);
router.put('/:id', authenticateToken, requireAdmin, updateCampaign);
router.delete('/:id', authenticateToken, requireAdmin, deleteCampaign);

// Authenticated user routes
router.get('/allCampaigns', authenticateToken, getAllCampaigns);
router.get('/:id', authenticateToken, getCampaignById);

export default router;
