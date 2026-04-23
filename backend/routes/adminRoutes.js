import express from 'express';
import { getAllUsers, toggleBlockUser, deleteUser, getAllGlobalTransactions } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/users').get(protect, admin, getAllUsers);
router.route('/users/:id/toggle-block').put(protect, admin, toggleBlockUser);
router.route('/users/:id').delete(protect, admin, deleteUser);

router.route('/transactions').get(protect, admin, getAllGlobalTransactions);

export default router;
