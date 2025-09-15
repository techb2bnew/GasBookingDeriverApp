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
import { fontSize, spacing, borderRadius,wp,hp } from '../utils/dimensions';

const OrderHistoryScreen = () => {
  const { orderHistory, fetchOrderHistory } = useOrder();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, delivered, canceled

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrderHistory();
    setRefreshing(false);
  };

  const getFilteredOrders = () => {
    if (filter === 'all') return orderHistory;
    return orderHistory.filter(order => order.status === filter);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return '#10b981';
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
          <Text style={styles.orderId}>#{order.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.status)}15` }]}>
            <Icon
              name={getStatusIcon(order.status)}
              size={12}
              color={getStatusColor(order.status)}
            />
            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={styles.orderDate}>{formatDate(order.completedAt || order.createdAt)}</Text>
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.detailRow}>
          <Icon name="local-gas-station" size={16} color="#717182" />
          <Text style={styles.detailText}>{order.gasStation.name}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="person" size={16} color="#717182" />
          <Text style={styles.detailText}>{order.customer.name}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="local-gas-station" size={16} color="#717182" />
          <Text style={styles.detailText}>
            {order.gasType} - {order.quantity} cylinder{order.quantity > 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="attach-money" size={16} color="#717182" />
          <Text style={styles.detailText}>
            Order: ₹{order.total} | Fee: ₹{order.deliveryFee || 0}
          </Text>
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

      <View style={styles.filterContainer}>
        <FilterButton title="All" value="all" active={filter === 'all'} />
        <FilterButton title="Delivered" value="delivered" active={filter === 'delivered'} />
        <FilterButton title="Canceled" value="canceled" active={filter === 'canceled'} />
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
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: '#1f2937', // Dark text
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderId: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#1f2937', // Dark text
    marginRight: spacing.sm,
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
    color: '#6b7280', // Gray text
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
    marginLeft: 8,
  },
});

export default OrderHistoryScreen;