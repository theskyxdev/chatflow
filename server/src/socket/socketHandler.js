import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

// Store active socket connections
const userSockets = new Map(); // userId -> Set of socketIds
const typingUsers = new Map(); // conversationId -> Set of userIds

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = verifyAccessToken(token);

      if (!decoded) {
        return next(new Error('Authentication error: Invalid token'));
      }

      const user = await User.findById(decoded.userId);

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;

    // Add socket to user's active connections
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    // Update user's online status
    await User.findByIdAndUpdate(userId, {
      isOnline: true,
      lastSeen: new Date(),
    });

    // Notify all users about online status
    io.emit('user_online', {
      userId,
      isOnline: true,
    });

    // Join user's personal room
    socket.join(userId);

    // Join all conversation rooms user is part of
    const conversations = await Conversation.find({ participants: userId });
    conversations.forEach((conv) => {
      socket.join(conv._id.toString());
    });

    // Handle joining a specific conversation
    socket.on('join_conversation', async (conversationId) => {
      try {
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: userId,
        });

        if (conversation) {
          socket.join(conversationId);
        }
      } catch (error) {
        console.error('Join conversation error:', error);
      }
    });

    // Handle leaving a conversation
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId);
      
      // Remove from typing users
      if (typingUsers.has(conversationId)) {
        typingUsers.get(conversationId).delete(userId);
        if (typingUsers.get(conversationId).size === 0) {
          typingUsers.delete(conversationId);
        }
      }
    });

    // Handle sending a message
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, text, tempId } = data;

        // Verify user is participant
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: userId,
        });

        if (!conversation) {
          return socket.emit('error', { message: 'Conversation not found' });
        }

        // Create message
        const message = await Message.create({
          conversationId,
          senderId: userId,
          text,
          status: 'sent',
        });

        // Update conversation
        conversation.lastMessage = message._id;
        conversation.updatedAt = new Date();
        await conversation.save();

        // Populate sender
        await message.populate('senderId', 'name username avatarUrl');

        // Mark as delivered for recipient
        const recipientId = conversation.participants.find(
          (p) => p.toString() !== userId
        );

        if (recipientId && userSockets.has(recipientId.toString())) {
          message.status = 'delivered';
          await message.save();
        }

        // Emit to conversation room
        io.to(conversationId).emit('receive_message', {
          message,
          tempId, // Send back tempId for optimistic UI update
        });

        // Send notification to recipient if they're online but not in the conversation
        if (recipientId) {
          const recipientSocketIds = userSockets.get(recipientId.toString());
          if (recipientSocketIds) {
            recipientSocketIds.forEach((socketId) => {
              const recipientSocket = io.sockets.sockets.get(socketId);
              if (recipientSocket && !recipientSocket.rooms.has(conversationId)) {
                recipientSocket.emit('new_notification', {
                  type: 'message',
                  conversationId,
                  message,
                });
              }
            });
          }
        }

        // Clear typing indicator
        if (typingUsers.has(conversationId)) {
          typingUsers.get(conversationId).delete(userId);
        }
        io.to(conversationId).emit('user_stop_typing', { userId, conversationId });
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', ({ conversationId }) => {
      if (!typingUsers.has(conversationId)) {
        typingUsers.set(conversationId, new Set());
      }
      typingUsers.get(conversationId).add(userId);

      socket.to(conversationId).emit('user_typing', {
        userId,
        conversationId,
      });
    });

    // Handle stop typing
    socket.on('stop_typing', ({ conversationId }) => {
      if (typingUsers.has(conversationId)) {
        typingUsers.get(conversationId).delete(userId);
      }

      socket.to(conversationId).emit('user_stop_typing', {
        userId,
        conversationId,
      });
    });

    // Handle message seen
    socket.on('message_seen', async (data) => {
      try {
        const { messageId, conversationId } = data;

        const message = await Message.findById(messageId);

        if (!message) return;

        // Update message status
        message.status = 'seen';

        // Add to seenBy if not already there
        const alreadySeen = message.seenBy.some(
          (s) => s.userId.toString() === userId
        );

        if (!alreadySeen) {
          message.seenBy.push({
            userId,
            seenAt: new Date(),
          });
        }

        await message.save();

        // Notify sender
        io.to(conversationId).emit('message_read', {
          messageId,
          conversationId,
          userId,
          seenAt: new Date(),
        });
      } catch (error) {
        console.error('Message seen error:', error);
      }
    });

    // Handle marking conversation as seen
    socket.on('conversation_seen', async (data) => {
      try {
        const { conversationId } = data;

        // Update all unseen messages
        const result = await Message.updateMany(
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

        if (result.modifiedCount > 0) {
          // Notify other participants
          socket.to(conversationId).emit('conversation_read', {
            conversationId,
            userId,
            seenAt: new Date(),
          });
        }
      } catch (error) {
        console.error('Conversation seen error:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      // Remove socket from user's active connections
      if (userSockets.has(userId)) {
        userSockets.get(userId).delete(socket.id);

        // If no more active connections, mark user as offline
        if (userSockets.get(userId).size === 0) {
          userSockets.delete(userId);

          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen: new Date(),
          });

          // Notify all users about offline status
          io.emit('user_offline', {
            userId,
            isOnline: false,
            lastSeen: new Date(),
          });
        }
      }

      // Clear typing indicators
      typingUsers.forEach((users, conversationId) => {
        if (users.has(userId)) {
          users.delete(userId);
          io.to(conversationId).emit('user_stop_typing', { userId, conversationId });
        }
      });
    });
  });

  return io;
};

export default initializeSocket;
