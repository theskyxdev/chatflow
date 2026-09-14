import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;
let currentToken = null;

export const initializeSocket = (token) => {
  // If socket already exists and token hasn't changed, reuse it
  if (socket && socket.connected && currentToken === token) {
    return socket;
  }

  // Disconnect existing socket if token changed
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  currentToken = token;
  
  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    // Socket connected
  });

  socket.on('disconnect', (reason) => {
    // Socket disconnected
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    console.warn('Socket not initialized');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentToken = null;
  }
};

export default { initializeSocket, getSocket, disconnectSocket };
