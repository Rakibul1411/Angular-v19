// routes/communicationRoute.js
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  createCommunication,
  getAllCommunications,
  getCommunicationById,
  updateCommunication,
  deleteCommunication
} from '../controllers/communicationController.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads/av-communications';
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio/video files allowed'), false);
    }
  }
});

// Routes
router.post('/createCommunication', authenticateToken, upload.single('file'), createCommunication);
router.get('/allCommunications', authenticateToken, getAllCommunications);
router.get('/:id', authenticateToken, getCommunicationById);
router.put('/:id', authenticateToken, upload.single('file'), updateCommunication);
router.delete('/:id', authenticateToken, deleteCommunication);

export default router;