const User = require('../models/User');

// GET /api/matches — find users where their offered skills match my wanted skills
const getMatches = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);

    if (!currentUser.skillsWanted.length && !currentUser.skillsOffered.length) {
      return res.json([]);
    }

    const wantedNames = currentUser.skillsWanted.map((s) => s.name.toLowerCase());
    const offeredNames = currentUser.skillsOffered.map((s) => s.name.toLowerCase());

    // Find users who offer what I want OR want what I offer
    const allUsers = await User.find({ _id: { $ne: req.user._id } })
      .select('-password')
      .lean();

    const matches = allUsers
      .map((user) => {
        const theyOffer = user.skillsOffered.map((s) => s.name.toLowerCase());
        const theyWant = user.skillsWanted.map((s) => s.name.toLowerCase());

        const matchedOffered = theyOffer.filter((s) => wantedNames.includes(s));
        const matchedWanted = theyWant.filter((s) => offeredNames.includes(s));

        const score = matchedOffered.length + matchedWanted.length;

        return { ...user, matchScore: score, matchedOffered, matchedWanted };
      })
      .filter((u) => u.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMatches };
