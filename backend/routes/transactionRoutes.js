import express from 'express';
import { addTransaction, getTransactions, deleteTransaction, undoDeleteTransaction } from '../controllers/transactionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, addTransaction)
  .get(protect, getTransactions);

router.route('/:id')
  .delete(protect, deleteTransaction);

router.route('/:id/undo')
  .put(protect, undoDeleteTransaction);

export default router;
