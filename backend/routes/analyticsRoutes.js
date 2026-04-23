import express from 'express';
import { getDashboardAnalytics, getNetBalanceBetweenUsers } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboardAnalytics);
router.get('/net-balance/:otherUserId', protect, getNetBalanceBetweenUsers);

export default router;
