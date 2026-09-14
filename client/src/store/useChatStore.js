import { create } from 'zustand';
import api from '../config/api';

const useChatStore = create((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  onlineUsers: new Set(),
  typingUsers: new Map(), // conversationId -> Set of userIds
  isLoadingConversations: false,
  isLoadingMessages: false,
  hasMoreMessages: true,
  messagePage: 1,

  // Fetch conversations
  fetchConversations: async () => {
    set({ isLoadingConversations: true });
    try {
      const { data } = await api.get('/conversations');
      set({ conversations: data.conversations, isLoadingConversations: false });
    } catch (error) {
      console.error('Fetch conversations error:', error);
      set({ isLoadingConversations: false });
    }
  },

  // Fetch messages for a conversation
  fetchMessages: async (conversationId, page = 1) => {
    set({ isLoadingMessages: true });
    try {
      const { data } = await api.get(`/messages/${conversationId}`, {
        params: { page, limit: 50 },
      });
      
      if (page === 1) {
        set({
          messages: data.messages,
          hasMoreMessages: data.pagination.hasMore,
          messagePage: 1,
          isLoadingMessages: false,
        });
      } else {
        set((state) => ({
          messages: [...data.messages, ...state.messages],
          hasMoreMessages: data.pagination.hasMore,
          messagePage: page,
          isLoadingMessages: false,
        }));
      }
    } catch (error) {
      console.error('Fetch messages error:', error);
      set({ isLoadingMessages: false });
    }
  },

  // Set current conversation
  setCurrentConversation: async (conversation) => {
    set({ 
      currentConversation: conversation, 
      messages: [],
      hasMoreMessages: true,
      messagePage: 1,
    });
    
    if (conversation) {
      await get().fetchMessages(conversation._id);
    }
  },

  // Create or get conversation
  createConversation: async (participantId) => {
    try {
      const { data } = await api.post('/conversations', { participantId });
      
      if (data.isNew) {
        set((state) => ({
          conversations: [data.conversation, ...state.conversations],
        }));
      }
      
      return data.conversation;
    } catch (error) {
      console.error('Create conversation error:', error);
      throw error;
    }
  },

  // Add message (optimistic update)
  addMessage: (message, tempId = null) => {
    set((state) => ({
      messages: [...state.messages, { ...message, tempId }],
    }));

    // Update conversation last message
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv._id === message.conversationId
          ? { ...conv, lastMessage: message, updatedAt: new Date() }
          : conv
      ),
    }));

    // Sort conversations by updatedAt
    set((state) => ({
      conversations: [...state.conversations].sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      ),
    }));
  },

  // Update message (replace temp with real)
  updateMessage: (tempId, realMessage) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.tempId === tempId ? { ...realMessage, tempId: null } : msg
      ),
    }));
  },

  // Update message status
  updateMessageStatus: (messageId, status) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg._id === messageId ? { ...msg, status } : msg
      ),
    }));
  },

  // Mark conversation as read
  markConversationAsRead: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
      ),
      messages: state.messages.map((msg) =>
        msg.conversationId === conversationId && msg.status !== 'seen'
          ? { ...msg, status: 'seen' }
          : msg
      ),
    }));
  },

  // Update user online status
  updateUserOnlineStatus: (userId, isOnline) => {
    set((state) => {
      const newOnlineUsers = new Set(state.onlineUsers);
      if (isOnline) {
        newOnlineUsers.add(userId);
      } else {
        newOnlineUsers.delete(userId);
      }
      return { onlineUsers: newOnlineUsers };
    });

    // Update conversations
    set((state) => ({
      conversations: state.conversations.map((conv) => ({
        ...conv,
        participants: conv.participants.map((p) =>
          p._id === userId ? { ...p, isOnline } : p
        ),
      })),
    }));

    // Update current conversation
    set((state) => {
      if (!state.currentConversation) return {};
      return {
        currentConversation: {
          ...state.currentConversation,
          participants: state.currentConversation.participants.map((p) =>
            p._id === userId ? { ...p, isOnline } : p
          ),
        },
      };
    });
  },

  // Set typing status
  setTypingStatus: (conversationId, userId, isTyping) => {
    set((state) => {
      const newTypingUsers = new Map(state.typingUsers);
      
      if (!newTypingUsers.has(conversationId)) {
        newTypingUsers.set(conversationId, new Set());
      }
      
      const conversationTyping = newTypingUsers.get(conversationId);
      
      if (isTyping) {
        conversationTyping.add(userId);
      } else {
        conversationTyping.delete(userId);
      }
      
      return { typingUsers: newTypingUsers };
    });
  },

  // Get all users
  getAllUsers: async () => {
    try {
      const { data } = await api.get('/users/all');
      return data.users;
    } catch (error) {
      console.error('Get all users error:', error);
      return [];
    }
  },

  // Search users
  searchUsers: async (query) => {
    try {
      const { data } = await api.get('/users/search', { params: { q: query } });
      return data.users;
    } catch (error) {
      console.error('Search users error:', error);
      return [];
    }
  },

  // Search messages
  searchMessages: async (query, conversationId = null) => {
    try {
      const params = { q: query };
      if (conversationId) params.conversationId = conversationId;
      
      const { data } = await api.get('/messages/search', { params });
      return data.messages;
    } catch (error) {
      console.error('Search messages error:', error);
      return [];
    }
  },

  // Delete conversation
  deleteConversation: async (conversationId) => {
    try {
      await api.delete(`/conversations/${conversationId}`);
      
      set((state) => ({
        conversations: state.conversations.filter((c) => c._id !== conversationId),
        currentConversation:
          state.currentConversation?._id === conversationId
            ? null
            : state.currentConversation,
        messages: state.currentConversation?._id === conversationId ? [] : state.messages,
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Delete conversation error:', error);
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Clear chat state
  clearChatState: () => {
    set({
      conversations: [],
      currentConversation: null,
      messages: [],
      onlineUsers: new Set(),
      typingUsers: new Map(),
      hasMoreMessages: true,
      messagePage: 1,
    });
  },
}));

export default useChatStore;
