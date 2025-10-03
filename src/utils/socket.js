import io from 'socket.io-client';
import { API_ENDPOINTS } from './constants';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(token) {
    if (!token) {
      console.warn('⚠️ No token provided for socket connection');
      return null;
    }

    if (this.socket && this.socket.connected) {
      console.log('✅ Socket already connected');
      return this.socket;
    }

    console.log('🔌 Connecting to Socket.IO server...');

    this.socket = io(API_ENDPOINTS.SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      forceNew: false,
    });

    this.setupEventListeners();
    return this.socket;
  }

  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Socket Connected - ID:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket Disconnected - Reason:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔴 Socket Connection Error:', error.message);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('🚫 Max reconnection attempts reached');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Socket Reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_attempt', () => {
      console.log('🔄 Attempting to reconnect...');
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('🔴 Reconnection Error:', error.message);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('🚫 Socket reconnection failed');
      this.isConnected = false;
    });

    // Generic error handler
    this.socket.on('error', (error) => {
      console.error('🔴 Socket Error:', error);
    });
  }

  // Subscribe to specific events
  subscribeToOrders() {
    if (this.socket && this.socket.connected) {
      console.log('📦 Subscribing to order updates');
      this.socket.emit('subscribe-orders');
    }
  }

  // Subscribe to agent updates
  subscribeToAgentUpdates() {
    if (this.socket && this.socket.connected) {
      console.log('👤 Subscribing to agent updates');
      this.socket.emit('subscribe-agents');
    }
  }

  // Unsubscribe from events
  unsubscribeFromOrders() {
    if (this.socket && this.socket.connected) {
      console.log('📦 Unsubscribing from order updates');
      this.socket.emit('unsubscribe-orders');
    }
  }

  // Listen to specific event
  on(eventName, callback) {
    if (this.socket) {
      this.socket.on(eventName, callback);
    }
  }

  // Remove listener
  off(eventName, callback) {
    if (this.socket) {
      this.socket.off(eventName, callback);
    }
  }

  // Emit event
  emit(eventName, data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(eventName, data);
    } else {
      console.warn(`⚠️ Cannot emit ${eventName}: Socket not connected`);
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
    }
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected && this.socket && this.socket.connected;
  }
}

export default new SocketService();
