const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    bio: { type: String, default: '', maxlength: 500 },
    avatar: { type: String, default: '' },
    location: { type: String, default: '' },
    skillsOffered: [
      {
        name: { type: String, required: true },
        category: { type: String, default: 'General' },
        level: {
          type: String,
          enum: ['Beginner', 'Intermediate', 'Expert'],
          default: 'Intermediate',
        },
      },
    ],
    skillsWanted: [
      {
        name: { type: String, required: true },
        category: { type: String, default: 'General' },
        level: {
          type: String,
          enum: ['Beginner', 'Intermediate', 'Expert'],
          default: 'Beginner',
        },
      },
    ],
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
