import React, { useEffect, useState } from 'react';
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
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import OrderCard from '../components/OrderCard';
import CurrentOrderBanner from '../components/CurrentOrderBanner';
import CustomAlert from '../components/CustomAlert';
import { wp, hp, fontSize, spacing, borderRadius } from '../utils/dimensions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';

const DashboardScreen = ({ navigation }) => {
  const { user, deliveryAgent, updateUser } = useAuth();
  const {
    availableOrders,
    currentOrder,
    loading,
    fetchAvailableOrders,
    acceptOrder,
  } = useOrder();
  const { startLocationTracking, stopLocationTracking, isTracking } = useLocation();
  const [refreshing, setRefreshing] = useState(false);
  const [showAcceptAlert, setShowAcceptAlert] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showStatusAlert, setShowStatusAlert] = useState(false);
  const [newStatus, setNewStatus] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchAvailableOrders(deliveryAgent?.status);
    fetchLatestProfile();

    (async () => {
      if (!isTracking) {
        try {
          await startLocationTracking();
        } catch (e) {
          console.error('startLocationTracking failed:', e);
        }
      }
    })();
  }, [deliveryAgent?.status]);

  const fetchLatestProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const result = await authService.getProfile(token);
        if (result.success) {
          await updateUser({ user: result.user, deliveryAgent: result.deliveryAgent });
        }
      }
    } catch (error) {
      console.error('Failed to fetch latest profile:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAvailableOrders(deliveryAgent?.status);
    setRefreshing(false);
  };

  const handleAcceptOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setShowAcceptAlert(true);
  };

  const confirmAcceptOrder = async () => {
    setShowAcceptAlert(false);
    try {
      const result = await acceptOrder(selectedOrderId);
      if (result.success) {
        // Navigate to OrderDetail screen with the accepted order
        navigation.navigate('OrderDetail');
      } else {
        console.log('Error', result.error || 'Failed to accept order');
      }
    } catch (error) {
      console.log('Error', 'Failed to accept order');
    }
    setSelectedOrderId(null);
  };

  const cancelAcceptOrder = () => {
    setShowAcceptAlert(false);
    setSelectedOrderId(null);
  };

  const handleStatusChange = (newStatus) => {
    setNewStatus(newStatus);
    setShowStatusAlert(true);
  };

  const confirmStatusChange = async () => {
    setShowStatusAlert(false);
    setIsUpdatingStatus(true);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.log('Error', 'Authentication token not found');
        return;
      }

      const result = await authService.updateAgentStatus(token, newStatus);

      if (result.success) {
        // Update the deliveryAgent status in context
        const updatedDeliveryAgent = { ...deliveryAgent, status: newStatus };
        await updateUser({ user, deliveryAgent: updatedDeliveryAgent });
        
        if (newStatus === 'online') {
          await startLocationTracking();
          // Fetch orders when going online
          await fetchAvailableOrders('online');
        } else {
          await stopLocationTracking();
          // Clear orders when going offline
          await fetchAvailableOrders('offline');
        }
        // Alert.alert('Success', `Status changed to ${newStatus}`);
      } else {
        console.log('Error', result.error || 'Failed to update status');
      }
    } catch (error) {
      console.log('Error', 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
      setNewStatus(null);
    }
  };

  const cancelStatusChange = () => {
    setShowStatusAlert(false);
    setNewStatus(null);
  };

  const renderOrderItem = ({ item }) => (
    <OrderCard
      order={item}
      onAccept={() => handleAcceptOrder(item?.id)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name || 'Driver'}</Text>
          <Text style={styles.subtitle}>Ready to deliver?</Text>
        </View>
        <TouchableOpacity
          style={[styles.statusIndicator, deliveryAgent?.status === 'online' && styles.statusIndicatorActive]}
          onPress={() => {
            if (deliveryAgent?.status === 'online') {
              handleStatusChange('offline');
            } else {
              handleStatusChange('online');
            }
          }}
          activeOpacity={0.7}
          disabled={isUpdatingStatus}
        >
          <View style={[styles.statusDot, deliveryAgent?.status === 'online' && styles.statusDotActive]} />
          <Text style={[styles.statusText, deliveryAgent?.status === 'online' && styles.statusTextActive]}>
            {deliveryAgent?.status === 'online' ? 'Online' : 'Offline'}
          </Text>
        </TouchableOpacity>
      </View>

      {currentOrder && (
        <CurrentOrderBanner
          order={currentOrder}
          onPress={() => navigation.navigate('OrderDetail')}
        />
      )}

      <View style={styles.ordersSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Orders</Text>
          <View style={styles.headerActions}>
            {deliveryAgent?.status === 'online' && (
              <TouchableOpacity 
                style={styles.activeOrdersButton}
                onPress={() => navigation.navigate('ActiveOrders')}
              >
                <Icon name="local-shipping" size={20} color="#ffffff" />
                <Text style={styles.activeOrdersButtonText}>Active Orders</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              onPress={onRefresh}
              disabled={deliveryAgent?.status !== 'online'}
              style={{ 
                opacity: deliveryAgent?.status === 'online' ? 1 : 0.5, 
                marginLeft: deliveryAgent?.status === 'online' ? 12 : 0 
              }}
            >
              <Icon name="refresh" size={24} color="#030213" />
            </TouchableOpacity>
          </View>
        </View>

        {availableOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon 
              name={deliveryAgent?.status === 'online' ? "inbox" : "wifi-off"} 
              size={64} 
              color="#717182" 
            />
            <Text style={styles.emptyStateTitle}>
              {deliveryAgent?.status === 'online' ? 'No orders available' : 'You are offline'}
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              {deliveryAgent?.status === 'online' 
                ? 'Pull down to refresh and check for new orders'
                : 'Go online to see available orders'
              }
            </Text>
          </View>
        ) : (
          <FlatList
            data={availableOrders}
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

      <CustomAlert
        visible={showAcceptAlert}
        title="Accept Order"
        message="Are you sure you want to accept this order? You will be responsible for delivering it to the customer."
        type="info"
        confirmText="Accept Order"
        cancelText="Cancel"
        onConfirm={confirmAcceptOrder}
        onCancel={cancelAcceptOrder}
      />

      <CustomAlert
        visible={showStatusAlert}
        title="Change Status"
        message={`Are you sure you want to change your status to ${newStatus}?`}
        type="warning"
        confirmText="Yes"
        cancelText="Cancel"
        onConfirm={confirmStatusChange}
        onCancel={cancelStatusChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // White background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: "#3b82f6",
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  greeting: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: '#fff', // Dark text
  },
  subtitle: {
    fontSize: fontSize.md,
    color: '#fff', // Gray text
    marginTop: spacing.xs,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981', // Blue background
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: '#3b82f6', // Blue border
    backgroundColor: "red"
  },
  statusIndicatorActive: {
    backgroundColor: '#10b981', // Green background
    borderColor: '#10b981', // Green border
  },
  statusDot: {
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: spacing.xs,
    backgroundColor: '#ffffff', // White dot
    marginRight: spacing.sm,
  },
  statusDotActive: {
    backgroundColor: '#ffffff', // White dot
  },
  statusText: {
    fontSize: fontSize.sm,
    color: '#ffffff', // White text
    fontWeight: '500',
  },
  statusTextActive: {
    color: '#ffffff', // White text
    fontWeight: '600',
  },
  ordersSection: {
    flex: 1,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeOrdersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  activeOrdersButtonText: {
    color: '#ffffff',
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#1f2937', // Dark text
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
    paddingBottom: 100,
  },
});

export default DashboardScreen;