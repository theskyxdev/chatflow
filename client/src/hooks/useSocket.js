import { useEffect, useCallback } from 'react';
import { getSocket } from '../config/socket';
import useChatStore from '../store/useChatStore';
import useAuthStore from '../store/useAuthStore';

// Use a module-level variable to track if we've already set up listeners
let listenersInitialized = false;

export const useSocket = () => {
  const socket = getSocket();
  const {
    addMessage,
    updateMessage,
    updateMessageStatus,
    updateUserOnlineStatus,
    setTypingStatus,
    markConversationAsRead,
  } = useChatStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!socket || listenersInitialized) return;

    // Listen for new messages
    const handleReceiveMessage = ({ message, tempId }) => {
      if (tempId) {
        // This is a response to an optimistic update - replace temp message
        updateMessage(tempId, message);
      } else {
        // This is a new message from another user
        addMessage(message, null);
      }
    };

    // Listen for message delivery status
    const handleMessageDelivered = ({ messageId }) => {
      updateMessageStatus(messageId, 'delivered');
    };

    // Listen for message read status
    const handleMessageRead = ({ messageId }) => {
      updateMessageStatus(messageId, 'seen');
    };

    // Listen for user online status
    const handleUserOnline = ({ userId, isOnline }) => {
      if (userId !== user?._id) {
        updateUserOnlineStatus(userId, isOnline);
      }
    };

    const handleUserOffline = ({ userId, isOnline }) => {
      if (userId !== user?._id) {
        updateUserOnlineStatus(userId, isOnline);
      }
    };

    // Listen for typing indicators
    const handleUserTyping = ({ userId, conversationId }) => {
      setTypingStatus(conversationId, userId, true);
    };

    const handleUserStopTyping = ({ userId, conversationId }) => {
      setTypingStatus(conversationId, userId, false);
    };

    // Listen for conversation read
    const handleConversationRead = ({ conversationId }) => {
      markConversationAsRead(conversationId);
    };

    // Add listeners
    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_delivered', handleMessageDelivered);
    socket.on('message_read', handleMessageRead);
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);
    socket.on('conversation_read', handleConversationRead);

    listenersInitialized = true;

    return () => {
      // Only clean up on app unmount, not component unmount
      // This prevents duplicate listeners while keeping connection alive
    };
  }, [socket, user, addMessage, updateMessage, updateMessageStatus, updateUserOnlineStatus, setTypingStatus, markConversationAsRead]);

  // Send message
  const sendMessage = useCallback(
    (conversationId, text) => {
      if (!socket) return;

      const tempId = `temp_${Date.now()}`;
      
      // Do optimistic update first
      const optimisticMessage = {
        _id: tempId,
        conversationId,
        senderId: user?._id,
        text,
        status: 'sent',
        createdAt: new Date(),
        tempId,
      };
      addMessage(optimisticMessage, tempId);
      
      // Then send via socket
      socket.emit('send_message', {
        conversationId,
        text,
        tempId,
      });
    },
    [socket, user, addMessage]
  );

  // Send typing indicator
  const sendTyping = useCallback(
    (conversationId) => {
      if (!socket) return;
      socket.emit('typing', { conversationId });
    },
    [socket]
  );

  // Send stop typing
  const sendStopTyping = useCallback(
    (conversationId) => {
      if (!socket) return;
      socket.emit('stop_typing', { conversationId });
    },
    [socket]
  );

  // Mark message as seen
  const markMessageAsSeen = useCallback(
    (messageId, conversationId) => {
      if (!socket) return;
      socket.emit('message_seen', { messageId, conversationId });
    },
    [socket]
  );

  // Mark conversation as read
  const markConversationAsReadSocket = useCallback(
    (conversationId) => {
      if (!socket) return;
      socket.emit('conversation_seen', { conversationId });
    },
    [socket]
  );

  // Join conversation
  const joinConversation = useCallback(
    (conversationId) => {
      if (!socket) return;
      socket.emit('join_conversation', conversationId);
    },
    [socket]
  );

  // Leave conversation
  const leaveConversation = useCallback(
    (conversationId) => {
      if (!socket) return;
      socket.emit('leave_conversation', conversationId);
    },
    [socket]
  );

  return {
    socket,
    sendMessage,
    sendTyping,
    sendStopTyping,
    markMessageAsSeen,
    markConversationAsReadSocket,
    joinConversation,
    leaveConversation,
  };
};

export default useSocket;
