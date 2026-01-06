import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../utils/constants';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { borderRadius, spacing } from '../utils/dimensions';

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
        setNotifications(data?.data?.notifications || []);
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

  // =========================
  // PUT /api/notifications/:id/read
  // =========================
  const markAsRead = async notification => {
    try {
      const token = await AsyncStorage.getItem('authToken');
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
      navigation.navigate('Orders');
    } catch (error) {
      console.log('markAsRead error', error);
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
    <SafeAreaView style={[styles.container, { paddingTop: 2 }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}
        </Text>

        <TouchableOpacity onPress={markAllAsRead} disabled={unreadCount === 0}>
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
    </SafeAreaView>
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
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
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
