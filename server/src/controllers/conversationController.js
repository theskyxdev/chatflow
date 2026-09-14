import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

// Get all conversations for current user
export const getConversations = async (req, res) => {
  try {
    const userId = req.userId;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'name username avatarUrl isOnline lastSeen')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    // Add unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          senderId: { $ne: userId },
          status: { $ne: 'seen' },
        });

        return {
          ...conv.toObject(),
          unreadCount,
        };
      })
    );

    res.json({ conversations: conversationsWithUnread });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get conversation by ID
export const getConversationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const conversation = await Conversation.findOne({
      _id: id,
      participants: userId,
    }).populate('participants', 'name username avatarUrl isOnline lastSeen');

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json({ conversation });
  } catch (error) {
    console.error('Get conversation by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create or get existing conversation
export const createConversation = async (req, res) => {
  try {
    const { participantId } = req.body;
    const userId = req.userId;

    // Validate participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is trying to create conversation with themselves
    if (participantId === userId.toString()) {
      return res.status(400).json({ message: 'Cannot create conversation with yourself' });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findBetweenUsers(userId, participantId);

    if (conversation) {
      // Populate participants
      await conversation.populate('participants', 'name username avatarUrl isOnline lastSeen');
      return res.json({
        conversation,
        isNew: false,
      });
    }

    // Create new conversation
    conversation = await Conversation.create({
      participants: [userId, participantId],
    });

    await conversation.populate('participants', 'name username avatarUrl isOnline lastSeen');

    res.status(201).json({
      conversation,
      isNew: true,
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete conversation
export const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const conversation = await Conversation.findOne({
      _id: id,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Delete all messages in the conversation
    await Message.deleteMany({ conversationId: id });

    // Delete conversation
    await Conversation.findByIdAndDelete(id);

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search conversations
export const searchConversations = async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.userId;

    if (!q || q.trim().length === 0) {
      return res.json({ conversations: [] });
    }

    // Find users matching the search query
    const users = await User.find(
      {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { username: { $regex: q, $options: 'i' } },
        ],
      },
      '_id'
    );

    const userIds = users.map(u => u._id);

    // Find conversations with those users
    const conversations = await Conversation.find({
      participants: { $all: [userId], $in: userIds },
    })
      .populate('participants', 'name username avatarUrl isOnline lastSeen')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json({ conversations });
  } catch (error) {
    console.error('Search conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
