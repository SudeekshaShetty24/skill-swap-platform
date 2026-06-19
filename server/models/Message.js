const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 2000 },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// conversationId is always the two user IDs sorted and joined — ensures same room for both directions
messageSchema.statics.getConversationId = (id1, id2) =>
  [id1.toString(), id2.toString()].sort().join('_');

module.exports = mongoose.model('Message', messageSchema);
