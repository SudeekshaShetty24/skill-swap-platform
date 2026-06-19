const User = require('../models/User');

// GET /api/users — list all users (with optional search/filter)
const getUsers = async (req, res) => {
  try {
    const { search, category, level } = req.query;

    let query = { _id: { $ne: req.user._id } };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'skillsOffered.name': { $regex: search, $options: 'i' } },
        { 'skillsWanted.name': { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.$or = [
        { 'skillsOffered.category': category },
        { 'skillsWanted.category': category },
      ];
    }

    if (level) {
      query.$or = [
        { 'skillsOffered.level': level },
        { 'skillsWanted.level': level },
      ];
    }

    const users = await User.find(query).select('-password').lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/profile — update profile
const updateProfile = async (req, res) => {
  try {
    const { name, bio, location, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, location, avatar },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/:id — get single user profile
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('connections', 'name avatar email');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/users/connect/:id — send connection request
const connectUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    if (targetUser.pendingRequests.includes(req.user._id)) {
      return res.status(400).json({ message: 'Request already sent' });
    }

    if (targetUser.connections.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already connected' });
    }

    targetUser.pendingRequests.push(req.user._id);
    await targetUser.save();

    res.json({ message: 'Connection request sent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/users/profile — delete own account
const deleteProfile = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getUsers, updateProfile, getUserById, connectUser, deleteProfile };
