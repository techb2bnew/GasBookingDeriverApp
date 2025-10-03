import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import socketService from '../utils/socket';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children, isAuthenticated }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketInitialized = useRef(false);

  // Connect socket when user is authenticated
  useEffect(() => {
    const initializeSocket = async () => {
      if (isAuthenticated && !socketInitialized.current) {
        try {
          const token = await AsyncStorage.getItem('authToken');
          if (token) {
            console.log('🔌 Initializing Socket Connection...');
            const socketInstance = socketService.connect(token);
            
            if (socketInstance) {
              setSocket(socketInstance);
              socketInitialized.current = true;

              // Setup connection listeners
              socketInstance.on('connect', () => {
                console.log('✅ Socket Connected in Context');
                setIsConnected(true);
                
                // Subscribe to order updates for delivery agents
                socketService.subscribeToOrders();
                
                // Subscribe to agent updates
                socketService.subscribeToAgentUpdates();
              });

              socketInstance.on('disconnect', () => {
                console.log('❌ Socket Disconnected in Context');
                setIsConnected(false);
              });

              // Listen for system messages
              socketInstance.on('system:message', (data) => {
                console.log('📢 System Message:', data);
                const { message, messageType = 'info' } = data;
                
                Toast.show({
                  type: messageType === 'error' ? 'error' : 
                        messageType === 'warning' ? 'error' : 
                        messageType === 'success' ? 'success' : 'info',
                  text1: 'System Notification',
                  text2: message,
                  position: 'top',
                  visibilityTime: 5000,
                });
              });

              // Listen for agent status updates
              socketInstance.on('agent:status-updated', (data) => {
                console.log('🎯 Agent status updated:', data);
                const { data: agentData } = data;
                
                Toast.show({
                  type: 'success',
                  text1: 'Status Updated',
                  text2: `Your status is now ${agentData.status}`,
                  position: 'top',
                  visibilityTime: 3000,
                });
              });

              // Listen for generic notifications
              socketInstance.on('notification', (data) => {
                console.log('🔔 Notification:', data);
                const { type, data: notificationData } = data;
                
                // Handle different notification types
                if (type === 'USER_LOGGED_IN') {
                  console.log('👤 User logged in:', notificationData);
                }
              });
            }
          }
        } catch (error) {
          console.error('❌ Socket initialization error:', error);
        }
      }
    };

    initializeSocket();

    // Cleanup on unmount or logout
    return () => {
      if (!isAuthenticated && socketInitialized.current) {
        console.log('🔌 Cleaning up socket connection...');
        socketService.unsubscribeFromOrders();
        socketService.disconnect();
        setSocket(null);
        setIsConnected(false);
        socketInitialized.current = false;
      }
    };
  }, [isAuthenticated]);

  const value = {
    socket,
    isConnected,
    socketService,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
