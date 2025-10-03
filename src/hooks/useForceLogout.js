import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

/**
 * Hook to handle force logout events from Socket.IO
 * Listens for:
 * - user:force-logout (when user/agent is blocked)
 * - agent:updated (when agent is deactivated)
 */
export const useForceLogout = () => {
  const { socket } = useSocket();
  const { logout } = useAuth();

  useEffect(() => {
    if (!socket) return;

    // Handler for user force logout (account blocked)
    const handleUserForceLogout = (data) => {
      console.log('🚫 Force Logout Event:', data);
      const { type, message } = data.data || data;
      
      // Show alert to user
      Alert.alert(
        'Account Alert',
        message || 'Your account has been blocked or deactivated. Please contact support.',
        [
          {
            text: 'OK',
            onPress: async () => {
              // Perform logout
              await logout();
            },
          },
        ],
        { cancelable: false }
      );
    };

    // Handler for agent updates (status changed to inactive/blocked)
    const handleAgentUpdated = (data) => {
      console.log('👤 Agent Updated Event:', data);
      const agentData = data.data || data;
      
      // Check if agent status changed to inactive or blocked
      if (agentData.status === 'inactive' || agentData.status === 'blocked') {
        Alert.alert(
          'Account Status Changed',
          'Your agent account has been deactivated. Please contact your agency.',
          [
            {
              text: 'OK',
              onPress: async () => {
                await logout();
              },
            },
          ],
          { cancelable: false }
        );
      }
    };

    // Listen to force logout events
    console.log('👂 Setting up force logout listeners...');
    socket.on('user:force-logout', handleUserForceLogout);
    socket.on('agent:updated', handleAgentUpdated);

    // Cleanup listeners on unmount
    return () => {
      console.log('🧹 Cleaning up force logout listeners...');
      socket.off('user:force-logout', handleUserForceLogout);
      socket.off('agent:updated', handleAgentUpdated);
    };
  }, [socket, logout]);
};

export default useForceLogout;
