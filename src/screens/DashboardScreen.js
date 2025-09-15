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

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
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

  useEffect(() => {
    fetchAvailableOrders();

    (async () => {
      if (!isTracking) {
        try {
          await startLocationTracking();
        } catch (e) {
          console.error('startLocationTracking failed:', e);
        }
      }
    })();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAvailableOrders();
    setRefreshing(false);
  };

  const handleAcceptOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setShowAcceptAlert(true);
  };

  const confirmAcceptOrder = async () => {
    setShowAcceptAlert(false);
    const result = await acceptOrder(selectedOrderId);
    if (result.success) {
      navigation.navigate('OrderDetail');
    } else {
      Alert.alert('Error', 'Failed to accept order');
    }
    setSelectedOrderId(null);
  };

  const cancelAcceptOrder = () => {
    setShowAcceptAlert(false);
    setSelectedOrderId(null);
  };

  const renderOrderItem = ({ item }) => (
    <OrderCard
      order={item}
      onAccept={() => handleAcceptOrder(item.id)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name || 'Driver'}!</Text>
          <Text style={styles.subtitle}>Ready to deliver?</Text>
        </View>
        <TouchableOpacity
          style={[styles.statusIndicator, isTracking && styles.statusIndicatorActive]}
          onPress={() => {
            if (isTracking) {
              stopLocationTracking();
              Alert.alert('Status Changed', 'You are now offline');
            } else {
              startLocationTracking();
              Alert.alert('Status Changed', 'You are now online');
            }
          }}
          activeOpacity={0.7}
        >
          <View style={[styles.statusDot, isTracking && styles.statusDotActive]} />
          <Text style={[styles.statusText, isTracking && styles.statusTextActive]}>
            {isTracking ? 'Online' : 'Offline'}
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
          <TouchableOpacity onPress={onRefresh}>
            <Icon name="refresh" size={24} color="#030213" />
          </TouchableOpacity>
        </View>

        {availableOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="inbox" size={64} color="#717182" />
            <Text style={styles.emptyStateTitle}>No orders available</Text>
            <Text style={styles.emptyStateSubtitle}>
              Pull down to refresh and check for new orders
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
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
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