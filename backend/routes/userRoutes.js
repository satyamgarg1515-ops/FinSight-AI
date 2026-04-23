import express from 'express';
import { getUsers, updateUserStatus, deleteUser } from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getUsers);

router.route('/:id/status')
  .put(protect, admin, updateUserStatus);

router.route('/:id')
  .delete(protect, admin, deleteUser);

export default router;
