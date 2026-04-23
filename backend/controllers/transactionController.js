import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
export const addTransaction = async (req, res) => {
  try {
    const { receiver, amount, date, note } = req.body;
    const sender = req.user._id;

    if (sender.toString() === receiver) {
      return res.status(400).json({ message: 'Sender and receiver cannot be the same' });
    }

    // Check for duplicate transaction
    const duplicate = await Transaction.findOne({
      sender,
      receiver,
      amount,
      note,
      isDeleted: false,
    });

    if (duplicate) {
      return res.status(400).json({ message: 'Duplicate transaction detected' });
    }

    const transaction = await Transaction.create({
      sender,
      receiver,
      amount,
      date: date || Date.now(),
      note,
    });

    // Send Notification to receiver
    await Notification.create({
      user: receiver,
      message: `You were added in a transaction by ${req.user.username} for ₹${amount}`,
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user transactions
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
      isDeleted: false,
    })
      .populate('sender', 'username email')
      .populate('receiver', 'username email')
      .sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.sender.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    transaction.isDeleted = true;
    transaction.deletedAt = Date.now();
    await transaction.save();

    res.json({ message: 'Transaction marked as deleted', transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Undo deleted transaction
// @route   PUT /api/transactions/:id/undo
// @access  Private
export const undoDeleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (!transaction.isDeleted) {
      return res.status(400).json({ message: 'Transaction is not deleted' });
    }

    const tenSecondsAgo = new Date(Date.now() - 10000);
    if (transaction.deletedAt < tenSecondsAgo) {
      return res.status(400).json({ message: 'Undo window (10 seconds) has expired' });
    }

    transaction.isDeleted = false;
    transaction.deletedAt = null;
    await transaction.save();

    res.json({ message: 'Transaction restored', transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
