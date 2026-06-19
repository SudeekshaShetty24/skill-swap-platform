const Swap = require('../models/Swap');

const populate = 'initiator partner';
const selectFields = 'name avatar skillsOffered skillsWanted';

// POST /api/swaps — propose a swap
const createSwap = async (req, res) => {
  try {
    const { partnerId, initiatorTeaches, partnerTeaches } = req.body;
    if (!partnerId || !initiatorTeaches || !partnerTeaches)
      return res.status(400).json({ message: 'partnerId, initiatorTeaches and partnerTeaches are required' });

    // Prevent duplicate active/pending swaps between same pair
    const existing = await Swap.findOne({
      $or: [
        { initiator: req.user._id, partner: partnerId },
        { initiator: partnerId, partner: req.user._id },
      ],
      status: { $in: ['pending', 'active'] },
    });
    if (existing) return res.status(400).json({ message: 'A swap already exists with this user' });

    const swap = await Swap.create({
      initiator: req.user._id,
      partner: partnerId,
      initiatorTeaches,
      partnerTeaches,
      progress: [
        { userId: req.user._id, skillName: partnerTeaches, percent: 0, milestones: [] },
        { userId: partnerId,    skillName: initiatorTeaches, percent: 0, milestones: [] },
      ],
    });

    const populated = await swap.populate(populate, selectFields);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/swaps — my swaps
const getMySwaps = async (req, res) => {
  try {
    const swaps = await Swap.find({
      $or: [{ initiator: req.user._id }, { partner: req.user._id }],
    })
      .populate(populate, selectFields)
      .sort({ updatedAt: -1 });
    res.json(swaps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/swaps/:id
const getSwap = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id).populate(populate, selectFields);
    if (!swap) return res.status(404).json({ message: 'Swap not found' });
    const isMember = [swap.initiator._id.toString(), swap.partner._id.toString()].includes(req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Not authorized' });
    res.json(swap);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/swaps/:id/status — accept / decline / complete
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap not found' });
    swap.status = status;
    await swap.save();
    const populated = await swap.populate(populate, selectFields);
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/swaps/:id/resources
const addResource = async (req, res) => {
  try {
    const { title, url, type } = req.body;
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap not found' });
    swap.resources.push({ addedBy: req.user._id, title, url, type: type || 'link' });
    await swap.save();
    const populated = await swap.populate(populate, selectFields);
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/swaps/:id/resources/:resourceId
const deleteResource = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    swap.resources = swap.resources.filter(r => r._id.toString() !== req.params.resourceId);
    await swap.save();
    res.json(swap);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/swaps/:id/sessions
const addSession = async (req, res) => {
  try {
    const { scheduledAt, topic } = req.body;
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap not found' });
    swap.sessions.push({ scheduledAt, topic });
    await swap.save();
    const populated = await swap.populate(populate, selectFields);
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/swaps/:id/sessions/:sessionId
const updateSession = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    const session = swap.sessions.id(req.params.sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    Object.assign(session, req.body);
    await swap.save();
    res.json(swap);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/swaps/:id/progress — update my learning progress
const updateProgress = async (req, res) => {
  try {
    const { percent, milestones } = req.body;
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap not found' });

    let prog = swap.progress.find(p => p.userId.toString() === req.user._id.toString());
    if (!prog) {
      swap.progress.push({ userId: req.user._id, skillName: '', percent: percent || 0, milestones: milestones || [] });
    } else {
      if (percent !== undefined) prog.percent = percent;
      if (milestones !== undefined) prog.milestones = milestones;
    }
    await swap.save();
    res.json(swap);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/swaps/:id/notes
const updateNotes = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap not found' });
    swap.sharedNotes = req.body.sharedNotes || '';
    await swap.save();
    res.json(swap);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createSwap, getMySwaps, getSwap,
  updateStatus, addResource, deleteResource,
  addSession, updateSession, updateProgress, updateNotes,
};
