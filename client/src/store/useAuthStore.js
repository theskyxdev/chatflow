import { create } from 'zustand';
import api from '../config/api';
import { initializeSocket, disconnectSocket } from '../config/socket';

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,

  // Register user
  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', userData);
      
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      set({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });

      // Initialize socket connection
      initializeSocket(data.accessToken);

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  // Login user
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', credentials);
      
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      set({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });

      // Initialize socket connection
      initializeSocket(data.accessToken);

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  // Logout user
  logout: async () => {
    try {
      const { refreshToken } = get();
      await api.post('/auth/logout', { refreshToken });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      disconnectSocket();
      
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
    }
  },

  // Get current user
  getCurrentUser: async () => {
    if (!get().accessToken) return;

    set({ isLoading: true });
    try {
      const { data } = await api.get('/users/me');
      set({ user: data.user, isLoading: false });
      
      // Initialize socket if not already connected
      if (get().accessToken) {
        initializeSocket(get().accessToken);
      }
    } catch (error) {
      console.error('Get current user error:', error);
      set({ isLoading: false });
      
      // If token is invalid, logout
      if (error.response?.status === 401) {
        get().logout();
      }
    }
  },

  // Update user profile
  updateProfile: async (updates) => {
    try {
      const { data } = await api.put('/users/profile', updates);
      set({ user: data.user });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      return { success: false, error: message };
    }
  },

  // Upload avatar
  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const { data } = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      set((state) => ({
        user: { ...state.user, avatarUrl: data.avatarUrl },
      }));
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Upload failed';
      return { success: false, error: message };
    }
  },

  // Change password
  changePassword: async (passwords) => {
    try {
      await api.put('/users/password', passwords);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      return { success: false, error: message };
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
