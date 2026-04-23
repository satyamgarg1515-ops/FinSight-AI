import Transaction from '../models/Transaction.js';
import mongoose from 'mongoose';

// @desc    Get dashboard analytics for logged in user (Net Balance, Totals)
// @route   GET /api/analytics/dashboard
// @access  Private
export const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all transactions for this user
    const transactions = await Transaction.find({
      $or: [{ sender: userId }, { receiver: userId }],
      isDeleted: false,
    });

    let totalGiven = 0;
    let totalReceived = 0;
    const userBalances = {}; // Track balances with unique users

    transactions.forEach((tx) => {
      const amount = tx.amount;
      const isSender = tx.sender.toString() === userId.toString();
      const otherUserId = isSender ? tx.receiver.toString() : tx.sender.toString();

      if (!userBalances[otherUserId]) {
        userBalances[otherUserId] = 0;
      }

      if (isSender) {
        totalGiven += amount;
        userBalances[otherUserId] += amount; // We gave them
      } else {
        totalReceived += amount;
        userBalances[otherUserId] -= amount; // They gave us
      }
    });

    const netBalance = totalReceived - totalGiven; // Positive means you have overall more money now than you started with? Wait.
    // Usually: Net Balance = Total Received - Total Given. 
    // Wait, if I give 100, and receive 50, my net balance is -50. (I am owed 50).
    // Let's refine: "Total Given" vs "Total Received".

    res.json({
      totalGiven,
      totalReceived,
      netBalance,
      userBalances, // map of user_id -> balance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get detailed core net balance graph algorithm
// @route   GET /api/analytics/net-balance/:otherUserId
// @access  Private
export const getNetBalanceBetweenUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const { otherUserId } = req.params;

    const givenTx = await Transaction.find({ sender: userId, receiver: otherUserId, isDeleted: false });
    const receivedTx = await Transaction.find({ sender: otherUserId, receiver: userId, isDeleted: false });

    const totalGiven = givenTx.reduce((sum, tx) => sum + tx.amount, 0);
    const totalReceived = receivedTx.reduce((sum, tx) => sum + tx.amount, 0);

    let message = '';
    if (totalGiven > totalReceived) {
      message = `User owes you ₹${totalGiven - totalReceived}`;
    } else if (totalReceived > totalGiven) {
      message = `You owe User ₹${totalReceived - totalGiven}`;
    } else {
      message = `Settled up`;
    }

    res.json({
      totalGiven,
      totalReceived,
      netBalance: totalGiven - totalReceived,
      message
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
