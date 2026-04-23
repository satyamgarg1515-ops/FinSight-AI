import User from '../models/User.js';

// @desc    Get all users (for search and admin)
// @route   GET /api/users
// @access  Private
export const getUsers = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? {
          username: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    // Don't include the current user in search results usually, but here maybe we want all
    const users = await User.find({ ...keyword, _id: { $ne: req.user._id } }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Block / Unblock a user
// @route   PUT /api/users/:id/status
// @access  Private/Admin
export const updateUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Admin') {
      return res.status(400).json({ message: 'Cannot change status of Admin' });
    }

    user.status = user.status === 'Active' ? 'Blocked' : 'Active';
    await user.save();

    res.json({ message: `User mapped to ${user.status}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Admin') {
      return res.status(400).json({ message: 'Cannot delete Admin' });
    }

    await User.deleteOne({ _id: user._id });

    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
