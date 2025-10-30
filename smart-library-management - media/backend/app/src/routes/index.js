import express from 'express';

import userRoutes from './userRoutes.js';
import bookRoutes from './bookRoutes.js';
import loanRoutes from './loanRoutes.js';
import brandRoutes from './brandRoutes.js';
import campaignRoutes from './campaignRoutes.js';
import communicationRoutes from './communicationRoutes.js';


const router = express.Router();

router.use('/api/users', userRoutes);
router.use('/api/books', bookRoutes);
router.use('/api/loans', loanRoutes);
router.use('/api/brands', brandRoutes);
router.use('/api/campaigns', campaignRoutes);
router.use('/api/communications', communicationRoutes);


export default router;