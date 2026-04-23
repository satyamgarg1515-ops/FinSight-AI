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
    }).populate('sender', 'username').populate('receiver', 'username');

    let totalGiven = 0;
    let totalReceived = 0;
    const userBalances = {};

    transactions.forEach((tx) => {
      const amount = tx.amount;
      const isSender = tx.sender._id.toString() === userId.toString();
      
      const otherUserId = isSender ? tx.receiver._id.toString() : tx.sender._id.toString();
      const otherUserName = isSender ? tx.receiver.username : tx.sender.username;

      if (!userBalances[otherUserId]) {
        userBalances[otherUserId] = { username: otherUserName, balance: 0 };
      }

      if (isSender) {
        totalGiven += amount;
        userBalances[otherUserId].balance += amount; 
      } else {
        totalReceived += amount;
        userBalances[otherUserId].balance -= amount;
      }
    });

    const netBalance = totalReceived - totalGiven;

    // Convert map to array for easier frontend rendering
    const balancesArray = Object.keys(userBalances).map((keys) => ({
      userId: keys,
      username: userBalances[keys].username,
      balance: userBalances[keys].balance
    }));

    res.json({
      totalGiven,
      totalReceived,
      netBalance,
      userBalances: balancesArray,
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
