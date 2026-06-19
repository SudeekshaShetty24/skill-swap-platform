const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const jwt = require('jsonwebtoken');
const Message = require('./models/Message');
const User = require('./models/User');

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: 'http://localhost:3000', credentials: true },
});

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// REST Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/swaps', require('./routes/swaps'));
app.use('/api/chatbot', require('./routes/chatbot'));

app.get('/', (req, res) => res.json({ message: 'Skill Swap API running' }));

// ── Socket.io — online users map ──
const onlineUsers = new Map(); // userId → socketId

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('No token'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.userId;
  onlineUsers.set(userId, socket.id);

  // Broadcast updated online list
  io.emit('online_users', Array.from(onlineUsers.keys()));

  // Join personal room for targeted delivery
  socket.join(userId);

  // ── Send message ──
  socket.on('send_message', async ({ receiverId, text }) => {
    if (!text?.trim() || !receiverId) return;

    try {
      const conversationId = Message.getConversationId(userId, receiverId);
      const msg = await Message.create({
        conversationId,
        sender: userId,
        receiver: receiverId,
        text: text.trim(),
      });

      const populated = await msg.populate('sender', 'name avatar');

      // Deliver to receiver's room (works even if they're on a different tab)
      io.to(receiverId).emit('receive_message', populated);
      // Echo back to sender (so their own message appears instantly)
      socket.emit('receive_message', populated);
    } catch (err) {
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // ── Typing indicator ──
  socket.on('typing', ({ receiverId, isTyping }) => {
    io.to(receiverId).emit('typing', { senderId: userId, isTyping });
  });

  // ── Mark messages read ──
  socket.on('mark_read', async ({ senderId }) => {
    const conversationId = Message.getConversationId(userId, senderId);
    await Message.updateMany(
      { conversationId, receiver: userId, read: false },
      { read: true }
    );
    // Notify sender their messages were read
    io.to(senderId).emit('messages_read', { by: userId });
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(userId);
    io.emit('online_users', Array.from(onlineUsers.keys()));
  });
});

// ── Start ──
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
