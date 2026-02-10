import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../utils/constants';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { borderRadius, spacing, hp, fontSize } from '../utils/dimensions';
import { authService } from '../services/authService';
import { useOrder } from '../context/OrderContext';

const COLORS = {
  // Red Theme Colors
  primary: '#DC143C', // Crimson Red - Main primary color
  secondary: '#C41E3A', // Dark Red - Secondary color
  accent: '#E53E3E', // Bright Red - Accent color

  // Background Colors
  background: '#F8FAFC', // Light Gray Blue
  surface: '#FFFFFF', // Pure White
  cardBackground: '#FFFFFF', // Card Background

  // Text Colors
  text: '#1E293B', // Dark Slate
  textSecondary: '#64748B', // Medium Slate
  textLight: '#94A3B8', // Light Slate

  // Status Colors
  success: '#10B981', // Emerald
  warning: '#F59E0B', // Amber
  error: '#DC143C', // Red - Matching theme
  info: '#DC143C', // Red - Matching theme

  // UI Colors
  border: '#E2E8F0', // Light Border
  shadow: '#000000', // Shadow
  white: '#FFFFFF', // White
  black: '#000000', // Black
  gray: '#9CA3AF', // Gray
  lightGray: '#F1F5F9', // Light Gray
  darkGray: '#475569', // Dark Gray

  // Gradient Colors
  gradientStart: '#DC143C', // Crimson Red Start
  gradientEnd: '#C41E3A', // Dark Red End

  // Special Colors
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.6)',
  highlight: '#FFE5E5', // Light Red highlight
  subtle: '#F8FAFC',

  // Very Light Blue
  blue: '#008ED8',
};

const BASE_URL = 'YOUR_BASE_URL_HERE'; // 🔴 change this
const NotificationItem = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.iconWrap}>
        <Ionicons
          name={item.isRead ? 'notifications-outline' : 'notifications'}
          size={22}
          color={COLORS.primary}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message} numberOfLines={2}>
          {item.content}
        </Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>

      {!item.isRead && <View style={styles.dot} />}
    </TouchableOpacity>
  );
};

const NotificationScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { setCurrentOrder } = useOrder();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([fetchNotifications(), fetchUnreadCount()]);
  };

  // =========================
  // GET /api/notifications
  // =========================
  const fetchNotifications = async () => {
    const token = await AsyncStorage.getItem('authToken');

    console.log('ttookeken', token);

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(
        `${API_ENDPOINTS.BASE_URL}/api/notifications`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (response.ok) {
        const notificationsList = data?.data?.notifications || [];
        console.log('Fetched notifications:', notificationsList);
        // Log first notification structure for debugging
        if (notificationsList.length > 0) {
          console.log('Sample notification structure:', JSON.stringify(notificationsList[0], null, 2));
        }
        setNotifications(notificationsList);
      }
    } catch (error) {
      console.log('fetchNotifications error', error);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GET /api/notifications/unread-count
  // =========================
  const fetchUnreadCount = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(
        `${API_ENDPOINTS.BASE_URL}/api/notifications/unread-count`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (response.ok) {
        setUnreadCount(data?.data?.unreadCount || 0);
      }
    } catch (error) {
      console.log('fetchUnreadCount error', error);
    }
  };

  // Extract order ID from notification content
  const extractOrderId = (notification) => {
    console.log('Extracting order ID from notification:', notification);
    
    // Check if notification has orderId field (various formats)
    if (notification.orderId) {
      console.log('Found orderId:', notification.orderId);
      return notification.orderId;
    }
    
    if (notification.order_id) {
      console.log('Found order_id:', notification.order_id);
      return notification.order_id;
    }
    
    if (notification.data?.orderId) {
      console.log('Found data.orderId:', notification.data.orderId);
      return notification.data.orderId;
    }
    
    if (notification.metadata?.orderId) {
      console.log('Found metadata.orderId:', notification.metadata.orderId);
      return notification.metadata.orderId;
    }
    
    // Try to extract from content text (e.g., "#ORD-035850-6NBPXN")
    const contentText = notification.content || notification.message || '';
    const orderMatch = contentText.match(/#ORD-[\w-]+/);
    if (orderMatch) {
      // Use full order number format (e.g., "ORD-035850-6NBPXN")
      const orderNumber = orderMatch[0].replace('#', '');
      console.log('Extracted order number from content:', orderNumber);
      return orderNumber;
    }
    
    // Try to extract from title
    const titleText = notification.title || '';
    const titleMatch = titleText.match(/#ORD-[\w-]+/);
    if (titleMatch) {
      const orderNumber = titleMatch[0].replace('#', '');
      console.log('Extracted order number from title:', orderNumber);
      return orderNumber;
    }
    
    console.warn('Could not extract order ID from notification');
    return null;
  };

  // =========================
  // PUT /api/notifications/:id/read
  // =========================
  const markAsRead = async notification => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      // Mark notification as read
      await fetch(
        `${API_ENDPOINTS.BASE_URL}/api/notifications/${notification.id}/read`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setNotifications(prev =>
        prev.map(n => (n.id === notification.id ? { ...n, isRead: true } : n)),
      );

      setUnreadCount(prev => Math.max(prev - 1, 0));
      
      // Extract order ID and navigate to order detail
      const orderId = extractOrderId(notification);
      
      if (orderId) {
        try {
          console.log('Fetching order details for orderId:', orderId);
          // Fetch order details
          const result = await authService.getOrderById(token, orderId);
          
          console.log('Order fetch result:', result);
          
          if (result.success && result.order) {
            // Set the order in context for order detail screen
            setCurrentOrder(result.order);
            console.log('Navigating to OrderDetail screen');
            // Navigate to OrderDetail screen
            navigation.navigate('OrderDetail');
          } else {
            // If order not found, try with order number format
            console.warn('Order not found with ID, trying alternative...');
            // Navigate to Dashboard as fallback
            navigation.navigate('Dashboard');
          }
        } catch (error) {
          console.error('Error fetching order details:', error);
          Alert.alert('Error', 'Failed to load order details. Please try again.');
          // Don't navigate on error, let user stay on notification screen
        }
      } else {
        // If no order ID found, just mark as read and stay on screen
        console.warn('No order ID found in notification');
        // Optionally show a message or navigate to Dashboard
        // navigation.navigate('Dashboard');
      }
    } catch (error) {
      console.error('markAsRead error:', error);
      Alert.alert('Error', 'Failed to process notification. Please try again.');
      // Don't navigate on error, let user stay on notification screen
    }
  };

  // =========================
  // PUT /api/notifications/read-all
  // =========================
  const markAllAsRead = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      await fetch(`${API_ENDPOINTS.BASE_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.log('markAllAsRead error', error);
    }
  };
  const EmptyNotification = () => {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="notifications-off-outline"
          size={64}
          color={COLORS.gray}
        />
        <Text style={styles.emptyTitle}>Notification not found</Text>
        <Text style={styles.emptySubText}>
          You don’t have any notifications right now
        </Text>
      </View>
    );
  };
  return (
    <View style={[styles.container]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}
        </Text>

        <TouchableOpacity
          style={styles.clearButton}
          onPress={markAllAsRead}
          disabled={unreadCount === 0}
        >
          <Text
            style={[styles.clearText, unreadCount === 0 && { opacity: 0.5 }]}
          >
            Read All
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator
          style={{ marginTop: 40 }}
          size="large"
          color={COLORS.primary}
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <NotificationItem item={item} onPress={() => markAsRead(item)} />
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={!loading ? <EmptyNotification /> : null}
        />
      )}
    </View>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: 20,
    paddingBottom: spacing.xl,
    // minHeight: hp(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  headerTitle: {
    flex: 1,
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },
  backButton: {
    padding: spacing.sm,
  },
  clearButton: {
    padding: spacing.sm,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  card: {
    backgroundColor: COLORS.CARD,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAF4FB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: { flex: 1 },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    color: COLORS.SUB_TEXT,
    marginBottom: 6,
  },
  time: {
    fontSize: 12,
    color: COLORS.SUB_TEXT,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.blue,
    marginLeft: 6,
    marginTop: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical:300,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.blue,
  },
  emptySubText: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
