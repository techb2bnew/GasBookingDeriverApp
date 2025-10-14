import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import OrderCard from '../components/OrderCard';
import { wp, hp, fontSize, spacing, borderRadius } from '../utils/dimensions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';

const ActiveOrdersScreen = ({ navigation }) => {
  const { deliveryAgent } = useAuth();
  const { setCurrentOrder } = useOrder();
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchActiveOrders();
  }, []);

  const fetchActiveOrders = async () => {
    try {
      setLoading(true);
      
      // If agent is offline, don't fetch orders
      if (deliveryAgent?.status !== 'online') {
        console.log('Agent is offline, not fetching active orders');
        setActiveOrders([]);
        return;
      }
      
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      // Call API to get active orders (out_for_delivery status)
      const result = await authService.getActiveOrders(token);
      
      if (result.success) {
        console.log('Active orders fetched:', result.orders);
        setActiveOrders(result.orders);
      } else {
        console.error('Error fetching active orders:', result.error);
        setActiveOrders([]);
      }
    } catch (error) {
      console.error('Error fetching active orders:', error);
      setActiveOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchActiveOrders();
    setRefreshing(false);
  };

  const handleOrderClick = async (orderId) => {
    try {
      setLoading(true);
      
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      // Fetch order details
      const result = await authService.getOrderById(token, orderId);
      
      if (result.success) {
        console.log('Order details fetched:', result.order);
        // Set the order in context for order detail screen
        setCurrentOrder(result.order);
        // Navigate to OrderDetail screen
        navigation.navigate('OrderDetail');
      } else {
        console.error('Error fetching order details:', result.error);
        Alert.alert('Error', result.error || 'Failed to load order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const renderOrderItem = ({ item }) => (
    <OrderCard
      order={item}
      onAccept={() => handleOrderClick(item?.id)}
      buttonText="Deliver"
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Active Orders</Text>
        <TouchableOpacity 
          onPress={onRefresh}
          disabled={deliveryAgent?.status !== 'online' || loading}
          style={{ opacity: deliveryAgent?.status === 'online' ? 1 : 0.5 }}
        >
          <Icon name="refresh" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {deliveryAgent?.status !== 'online' ? (
          <View style={styles.offlineState}>
            <Icon name="wifi-off" size={64} color="#717182" />
            <Text style={styles.offlineTitle}>You are offline</Text>
            <Text style={styles.offlineSubtitle}>
              Go online to see active orders
            </Text>
          </View>
        ) : activeOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="inbox" size={64} color="#717182" />
            <Text style={styles.emptyStateTitle}>No active orders</Text>
            <Text style={styles.emptyStateSubtitle}>
              Pull down to refresh and check for new orders
            </Text>
          </View>
        ) : (
          <FlatList
            data={activeOrders}
            renderItem={renderOrderItem}
            keyExtractor={item => item.id.toString()}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.ordersList}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: "#035db7",
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
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
    color: '#1f2937',
    marginTop: spacing.lg,
  },
  emptyStateSubtitle: {
    fontSize: fontSize.sm,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xxl,
  },
  offlineState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  offlineTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: spacing.lg,
  },
  offlineSubtitle: {
    fontSize: fontSize.sm,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xxl,
  },
  ordersList: {
    paddingBottom: 100,
  },
});

export default ActiveOrdersScreen;
