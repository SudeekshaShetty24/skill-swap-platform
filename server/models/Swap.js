const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  url: { type: String, default: '' },
  type: { type: String, enum: ['link', 'note', 'video', 'file'], default: 'link' },
}, { timestamps: true });

const sessionSchema = new mongoose.Schema({
  scheduledAt: { type: Date },
  topic: { type: String, default: '' },
  notes: { type: String, default: '' },
  completed: { type: Boolean, default: false },
}, { timestamps: true });

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  skillName: { type: String },
  percent: { type: Number, default: 0, min: 0, max: 100 },
  milestones: [{ label: String, done: { type: Boolean, default: false } }],
});

const swapSchema = new mongoose.Schema(
  {
    initiator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    partner:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // What each person teaches the other
    initiatorTeaches: { type: String, required: true }, // skill name
    partnerTeaches:   { type: String, required: true }, // skill name

    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'declined'],
      default: 'pending',
    },

    resources: [resourceSchema],
    sessions:  [sessionSchema],
    progress:  [progressSchema],

    // Free-form swap notes visible to both
    sharedNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Swap', swapSchema);
