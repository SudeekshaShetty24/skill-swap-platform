const Message = require('../models/Message');
const User = require('../models/User');

// GET /api/chat/conversations — list all users I've chatted with + last message
const getConversations = async (req, res) => {
  try {
    const myId = req.user._id;

    // Find all messages where I'm sender or receiver
    const messages = await Message.find({
      $or: [{ sender: myId }, { receiver: myId }],
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .lean();

    // Build a map of conversationId → latest message
    const convMap = {};
    for (const msg of messages) {
      if (!convMap[msg.conversationId]) {
        convMap[msg.conversationId] = msg;
      }
    }

    // Count unread per conversation
    const unreadCounts = await Message.aggregate([
      { $match: { receiver: myId, read: false } },
      { $group: { _id: '$conversationId', count: { $sum: 1 } } },
    ]);
    const unreadMap = {};
    unreadCounts.forEach((u) => (unreadMap[u._id] = u.count));

    const conversations = Object.values(convMap).map((msg) => {
      const other = msg.sender._id.toString() === myId.toString() ? msg.receiver : msg.sender;
      return {
        conversationId: msg.conversationId,
        other,
        lastMessage: msg.text,
        lastAt: msg.createdAt,
        unread: unreadMap[msg.conversationId] || 0,
      };
    });

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/chat/messages/:userId — get message history with a user
const getMessages = async (req, res) => {
  try {
    const myId = req.user._id;
    const otherId = req.params.userId;
    const conversationId = Message.getConversationId(myId, otherId);

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name avatar')
      .lean();

    // Mark all received messages as read
    await Message.updateMany(
      { conversationId, receiver: myId, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/chat/unread — total unread count
const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({ receiver: req.user._id, read: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getConversations, getMessages, getUnreadCount };
