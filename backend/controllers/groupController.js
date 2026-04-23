import Group from '../models/Group.js';
import Transaction from '../models/Transaction.js';
import mongoose from 'mongoose';

export const createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;
    
    // Ensure creator is in members
    const allMembers = Array.from(new Set([...members, req.user._id.toString()]));

    const group = await Group.create({
      name,
      createdBy: req.user._id,
      members: allMembers,
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate('members', 'username email')
      .populate('createdBy', 'username');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const splitGroupExpense = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    
    // only member can split
    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not participating in this group' });
    }

    const { totalAmount, note, category } = req.body;
    
    // The splitter paid the whole amount. Every other member owes them their slice.
    const numberOfMembers = group.members.length;
    if (numberOfMembers <= 1) return res.status(400).json({ message: 'Group must have > 1 members to split' });

    const splitAmount = (totalAmount / numberOfMembers).toFixed(2);

    const transactions = [];

    // Create debts from others -> me
    for (const memberId of group.members) {
      if (memberId.toString() !== req.user._id.toString()) {
        const tx = await Transaction.create({
          sender: req.user._id,
          receiver: memberId,
          amount: Number(splitAmount),
          note: `[Group: ${group.name}] ` + (note || 'Split Expense'),
          category: category || 'Other',
        });
        transactions.push(tx);
      }
    }

    res.status(201).json({ message: `Successfully split ₹${totalAmount} among ${numberOfMembers} members. Each owes ₹${splitAmount}.`, transactions });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
