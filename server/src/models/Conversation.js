import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

// Ensure exactly 2 participants for 1:1 chat
conversationSchema.pre('save', function (next) {
  if (this.participants.length !== 2) {
    return next(new Error('A conversation must have exactly 2 participants'));
  }
  next();
});

// Static method to find conversation between two users
conversationSchema.statics.findBetweenUsers = function (userId1, userId2) {
  return this.findOne({
    participants: { $all: [userId1, userId2] },
  });
};

// Virtual for unread count (will be populated in queries)
conversationSchema.virtual('unreadCount', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'conversationId',
  count: true,
  match: { status: { $ne: 'seen' } },
});

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
