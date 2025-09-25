import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fontSize, spacing, borderRadius, wp, hp } from '../utils/dimensions';

const OrderHistoryScreen = ({ navigation }) => {
  const { deliveryAgent } = useAuth();
  const [orderHistory, setOrderHistory] = useState([]);
  const [stats, setStats] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, delivered, cancelled

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.log('No auth token found');
        return;
      }

      const result = await authService.getAgentStats(token);

      if (result.success) {
        // Combine delivered and cancelled orders for "all" filter
        console.log('API Response:', result);

        // Handle both response structures
        const deliveredOrders = result.data?.deliveredOrders || [];
        const cancelledOrders = result.data?.cancelledOrders || [];
        const stats = result.data?.stats || result.stats || {};

        const allOrders = [...deliveredOrders, ...cancelledOrders];
        console.log('All Orders:', allOrders);
        console.log('Stats:', stats);

        setOrderHistory(allOrders);
        setStats(stats);
        console.log('Order history fetched successfully');
      } else {
        console.log('Error fetching order history:', result.error);
      }
    } catch (error) {
      console.log('Error fetching order history:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrderHistory();
    setRefreshing(false);
  };

  const getFilteredOrders = () => {
    if (filter === 'all') return orderHistory;
    if (filter === 'delivered') return orderHistory.filter(order => order.status === 'delivered');
    if (filter === 'cancelled') return orderHistory.filter(order => order.status === 'cancelled');
    return orderHistory;
  };
  const truncateText = (text, maxLength = 25) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };
  const capitalizeFirstLetter = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  };
  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      case 'canceled':
        return '#ef4444';
      default:
        return '#717182';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return 'check-circle';
      case 'cancelled':
        return 'cancel';
      case 'canceled':
        return 'cancel';
      default:
        return 'info';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const OrderItem = ({ order }) => (
    <View style={styles.orderItem}>
        <View style={styles.orderHeader}>
          <View style={styles.orderIdContainer}>
            <Text style={styles.orderId}>#{truncateText(order.id, 25)}</Text>
            <Text style={styles.orderDate}>{formatDate(order?.deliveredAt || order?.cancelledAt || order?.createdAt)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order?.status)}15` }]}>
            <Icon
              name={getStatusIcon(order?.status)}
              size={12}
              color={getStatusColor(order?.status)}
            />
            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
              {order?.status.charAt(0).toUpperCase() + order?.status.slice(1)}
            </Text>
          </View>
        </View>

      <View style={styles.orderDetails}>
        <View style={styles.detailRow}>
          <Icon name="person" size={16} color="#717182" />
          <Text style={styles.detailText}>{capitalizeFirstLetter(order?.customerName)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="location-on" size={16} color="#717182" />
          <Text style={styles.detailText}>{order?.customerAddress}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="attach-money" size={16} color="#717182" />
          <Text style={styles.detailText}>₹{order?.totalAmount}</Text>
        </View>
      </View>
    </View>
  );

  const FilterButton = ({ title, value, active }) => (
    <TouchableOpacity
      style={[styles.filterButton, active && styles.filterButtonActive]}
      onPress={() => setFilter(value)}>
      <Text style={[styles.filterButtonText, active && styles.filterButtonTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order History</Text>
      </View>

      {/* Stats Section */}
      {stats && Object.keys(stats).length > 0 && (
        <View style={styles.statsContainer}>
          <TouchableOpacity 
            style={styles.statCard} 
            onPress={() => {
              console.log('Navigating to Dashboard...');
              navigation.navigate('Dashboard');
            }}
          >
            <Text style={styles.statNumber}>{stats?.assignedOrders || '0'}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </TouchableOpacity>
          {deliveryAgent?.status === 'online' && (
            <TouchableOpacity 
              style={styles.statCard} 
              onPress={() => {
                console.log('Navigating to ActiveOrders...');
                navigation.navigate('ActiveOrders');
              }}
            >
              <Text style={styles.statNumber}>{stats?.outForDeliveryOrders || '0'}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </TouchableOpacity>
          )}
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats?.totalDeliveredOrders || 0}</Text>
            <Text style={styles.statLabel}>Delivered</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats?.cancelled || 0}</Text>
            <Text style={styles.statLabel}>Cancelled</Text>
          </View>
        </View>
      )}

      <View style={styles.filterContainer}>
        <FilterButton title="All" value="all" active={filter === 'all'} />
        <FilterButton title="Delivered" value="delivered" active={filter === 'delivered'} />
        <FilterButton title="Cancelled" value="cancelled" active={filter === 'cancelled'} />
      </View>

      {getFilteredOrders().length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="history" size={64} color="#717182" />
          <Text style={styles.emptyStateTitle}>No orders found</Text>
          <Text style={styles.emptyStateSubtitle}>
            {filter === 'all'
              ? 'You haven\'t completed any orders yet'
              : `No ${filter} orders found`
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={getFilteredOrders()}
          renderItem={({ item }) => <OrderItem order={item} />}
          keyExtractor={item => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // White background
  },
  header: {
    paddingHorizontal: spacing.xl,
     paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: "#3b82f6",
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: 'white', // Dark text
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginVertical: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  statNumber: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: '#6b7280',
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    marginVertical: spacing.lg,
  },
  filterButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: '#f3f4f6', // Light background
    marginRight: spacing.sm,
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6', // Blue
  },
  filterButtonText: {
    fontSize: fontSize.sm,
    color: '#6b7280', // Gray text
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#ffffff', // White text
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#1f2937', // Dark text
    marginTop: spacing.lg,
  },
  emptyStateSubtitle: {
    fontSize: fontSize.sm,
    color: '#6b7280', // Gray text
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xxl,
  },
  ordersList: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 100,
  },
  orderItem: {
    backgroundColor: '#f3f4f6', // Light background
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  orderIdContainer: {
    flex: 1,
  },
  orderId: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  orderDate: {
    fontSize: fontSize.xs,
    color: '#6b7280',
    marginTop: spacing.xs,
  },
  orderDetails: {
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#1f2937', // Dark text
    paddingHorizontal: 8,
  },
});

export default OrderHistoryScreen;