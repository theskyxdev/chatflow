import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

// Get messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.userId;

    // Verify user is participant in the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Get paginated messages
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(parseInt(limit))
      .populate('senderId', 'name username avatarUrl');

    // Reverse to show oldest first in the response
    messages.reverse();

    // Get total count for pagination
    const total = await Message.countDocuments({ conversationId });

    res.json({
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasMore: skip + messages.length < total,
      },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    const userId = req.userId;

    // Verify user is participant in the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Create message
    const message = await Message.create({
      conversationId,
      senderId: userId,
      text,
      status: 'sent',
    });

    // Update conversation's last message
    conversation.lastMessage = message._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    // Populate sender info
    await message.populate('senderId', 'name username avatarUrl');

    res.status(201).json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark message as seen
export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Can't mark own message as seen
    if (message.senderId.toString() === userId.toString()) {
      return res.status(400).json({ message: 'Cannot mark own message as seen' });
    }

    // Verify user is participant
    const conversation = await Conversation.findOne({
      _id: message.conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update status
    message.status = 'seen';
    
    // Add to seenBy if not already there
    const alreadySeen = message.seenBy.some(
      s => s.userId.toString() === userId.toString()
    );
    
    if (!alreadySeen) {
      message.seenBy.push({
        userId,
        seenAt: new Date(),
      });
    }

    await message.save();

    res.json({ message });
  } catch (error) {
    console.error('Mark message as seen error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark all messages in conversation as seen
export const markConversationAsSeen = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    // Verify user is participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Update all unseen messages from other participants
    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        status: { $ne: 'seen' },
      },
      {
        $set: { status: 'seen' },
        $push: {
          seenBy: {
            userId,
            seenAt: new Date(),
          },
        },
      }
    );

    res.json({ message: 'Messages marked as seen' });
  } catch (error) {
    console.error('Mark conversation as seen error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search messages
export const searchMessages = async (req, res) => {
  try {
    const { q, conversationId } = req.query;
    const userId = req.userId;

    if (!q || q.trim().length === 0) {
      return res.json({ messages: [] });
    }

    // Build query
    const query = {
      text: { $regex: q, $options: 'i' },
    };

    // If conversationId provided, search within that conversation
    if (conversationId) {
      // Verify user is participant
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId,
      });

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }

      query.conversationId = conversationId;
    } else {
      // Search in all user's conversations
      const conversations = await Conversation.find({
        participants: userId,
      }).select('_id');

      query.conversationId = { $in: conversations.map(c => c._id) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('senderId', 'name username avatarUrl')
      .populate('conversationId');

    res.json({ messages });
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete message
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only sender can delete message
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    await Message.findByIdAndDelete(id);

    // Update conversation's last message if this was the last message
    const conversation = await Conversation.findById(message.conversationId);
    if (conversation && conversation.lastMessage?.toString() === id) {
      const lastMessage = await Message.findOne({
        conversationId: message.conversationId,
      }).sort({ createdAt: -1 });
      
      conversation.lastMessage = lastMessage?._id || null;
      await conversation.save();
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
