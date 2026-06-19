const User = require('../models/User');

// POST /api/skills/offered — add offered skill
const addOfferedSkill = async (req, res) => {
  try {
    const { name, category, level } = req.body;
    if (!name) return res.status(400).json({ message: 'Skill name required' });

    const user = await User.findById(req.user._id);
    user.skillsOffered.push({ name, category: category || 'General', level: level || 'Intermediate' });
    await user.save();

    res.status(201).json(user.skillsOffered);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/skills/wanted — add wanted skill
const addWantedSkill = async (req, res) => {
  try {
    const { name, category, level } = req.body;
    if (!name) return res.status(400).json({ message: 'Skill name required' });

    const user = await User.findById(req.user._id);
    user.skillsWanted.push({ name, category: category || 'General', level: level || 'Beginner' });
    await user.save();

    res.status(201).json(user.skillsWanted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/skills/offered/:skillId
const deleteOfferedSkill = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.skillsOffered = user.skillsOffered.filter(
      (s) => s._id.toString() !== req.params.skillId
    );
    await user.save();
    res.json(user.skillsOffered);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/skills/wanted/:skillId
const deleteWantedSkill = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.skillsWanted = user.skillsWanted.filter(
      (s) => s._id.toString() !== req.params.skillId
    );
    await user.save();
    res.json(user.skillsWanted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/skills/offered/:skillId
const updateOfferedSkill = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const skill = user.skillsOffered.id(req.params.skillId);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    Object.assign(skill, req.body);
    await user.save();
    res.json(user.skillsOffered);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/skills/wanted/:skillId
const updateWantedSkill = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const skill = user.skillsWanted.id(req.params.skillId);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    Object.assign(skill, req.body);
    await user.save();
    res.json(user.skillsWanted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  addOfferedSkill,
  addWantedSkill,
  deleteOfferedSkill,
  deleteWantedSkill,
  updateOfferedSkill,
  updateWantedSkill,
};
