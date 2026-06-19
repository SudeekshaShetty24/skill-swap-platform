const express = require('express');
const router = express.Router();
const { getConversations, getMessages, getUnreadCount } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.get('/conversations', protect, getConversations);
router.get('/messages/:userId', protect, getMessages);
router.get('/unread', protect, getUnreadCount);

module.exports = router;
