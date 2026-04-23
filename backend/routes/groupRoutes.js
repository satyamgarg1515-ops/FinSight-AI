import express from 'express';
import { createGroup, getMyGroups, splitGroupExpense } from '../controllers/groupController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createGroup).get(protect, getMyGroups);
router.route('/:id/split').post(protect, splitGroupExpense);

export default router;
