import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  ScrollView,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useOrder } from '../context/OrderContext';
import { useLocation } from '../context/LocationContext';
import MapViewDirections from 'react-native-maps-directions';
import { fontSize, spacing, borderRadius, wp, hp } from '../utils/dimensions';
import { COLORS } from '../utils/constants';
import { authService } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrderDetailScreen = ({ navigation, route }) => {
  const { currentOrder, updateOrderStatus, acceptOrder, setCurrentOrder } = useOrder();
  const { currentLocation, route: locationRoute, eta, getRoute } = useLocation();
  const [mapRegion, setMapRegion] = useState(null);
  const [customerCoordinates, setCustomerCoordinates] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  console.log('currentOrdercurrentOrder', currentOrder);

  const mapRef = useRef(null);

  // Fetch order by orderId if passed via route params (from notification)
  useEffect(() => {
    const fetchOrderFromParams = async (retryCount = 0) => {
      const orderId = route?.params?.orderId;
      
      if (orderId && (!currentOrder || currentOrder.id !== orderId)) {
        console.log('Fetching order from notification orderId:', orderId, 'Retry:', retryCount);
        setLoadingOrder(true);
        try {
          const token = await AsyncStorage.getItem('authToken');
          
          if (token) {
            const result = await authService.getOrderById(token, orderId);
            if (result.success && result.order) {
              setCurrentOrder(result.order);
              console.log('Order fetched successfully:', result.order.orderNumber);
              setLoadingOrder(false);
            } else {
              console.error('Failed to fetch order:', result.error);
              // Retry up to 3 times with delay
              if (retryCount < 3) {
                setTimeout(() => {
                  fetchOrderFromParams(retryCount + 1);
                }, 1000 * (retryCount + 1)); // 1s, 2s, 3s delays
              } else {
                console.error('Max retries reached, order fetch failed');
                setLoadingOrder(false);
              }
            }
          } else {
            console.error('No auth token found');
            // Retry after delay in case token is being set
            if (retryCount < 2) {
              setTimeout(() => {
                fetchOrderFromParams(retryCount + 1);
              }, 1000);
            } else {
              setLoadingOrder(false);
            }
          }
        } catch (error) {
          console.error('Error fetching order from params:', error);
          // Retry up to 3 times with delay
          if (retryCount < 3) {
            setTimeout(() => {
              fetchOrderFromParams(retryCount + 1);
            }, 1000 * (retryCount + 1));
          } else {
            console.error('Max retries reached, order fetch failed');
            setLoadingOrder(false);
          }
        }
      } else if (!orderId && !currentOrder) {
        // No orderId in params and no currentOrder - don't show anything
        setLoadingOrder(false);
      } else {
        setLoadingOrder(false);
      }
    };

    fetchOrderFromParams();
  }, [route?.params?.orderId, currentOrder, setCurrentOrder, navigation]);

  // Geocode customer address when order changes
  useEffect(() => {
    if (currentOrder && currentOrder.customerAddress) {
      geocodeAddress(currentOrder.customerAddress).then(coords => {
        setCustomerCoordinates(coords);
      });
    }
  }, [currentOrder]);

  useEffect(() => {
    if (currentOrder && currentLocation && customerCoordinates) {
      const destination = customerCoordinates;

      if (destination) {
        // Get route from current location to customer
        getRoute(destination);

        // Set map region to include current location and customer location
        const midLat = (currentLocation.latitude + destination.latitude) / 2;
        const midLng = (currentLocation.longitude + destination.longitude) / 2;
        const latDelta =
          Math.abs(currentLocation.latitude - destination.latitude) * 1.5;
        const lngDelta =
          Math.abs(currentLocation.longitude - destination.longitude) * 1.5;

        setMapRegion({
          latitude: midLat,
          longitude: midLng,
          latitudeDelta: Math.max(latDelta, 0.01),
          longitudeDelta: Math.max(lngDelta, 0.01),
        });
      }
    }
  }, [currentOrder, currentLocation, customerCoordinates]);

  // Real-time location updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentOrder && currentLocation && customerCoordinates) {
        getRoute(customerCoordinates);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [currentOrder, currentLocation, customerCoordinates]);

  // Don't render screen if order is not available (no empty/default values)
  // Only render when order is successfully fetched
  if (!currentOrder) {
    // Return empty view - no error, no loading, no empty values
    return <View style={{ flex: 1, backgroundColor: COLORS.background }} />;
  }

  const geocodeAddress = async address => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address,
        )}&key=AIzaSyBtb6hSmwJ9_OznDC5e8BcZM90ms4WD_DE`,
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng,
        };
      }
    } catch (error) {
      console.log('Geocoding error:', error);
    }

    // Fallback to Mohali coordinates
    return {
      latitude: 30.7046,
      longitude: 76.7179,
    };
  };

  const getCurrentDestination = () => {
    if (!currentOrder || !currentOrder.customerAddress) return null;

    // Use geocoded coordinates if available
    if (customerCoordinates) {
      return customerCoordinates;
    }

    // Fallback to default Mohali coordinates
    return {
      latitude: 30.7046,
      longitude: 76.7179,
    };
  };

  const getCurrentAddress = () => {
    if (!currentOrder) return '';
    return currentOrder.customerAddress || '';
  };

  const handleAcceptOrder = async () => {
    if (!currentOrder?.id) {
      Alert.alert('Error', 'Order ID not found');
      return;
    }

    Alert.alert(
      'Accept Order',
      'Are you sure you want to accept this gas delivery order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              const result = await acceptOrder(currentOrder.id);
              if (result.success) {
                Alert.alert('Success', 'Order accepted successfully!');
              } else {
                Alert.alert('Error', result.error || 'Failed to accept order');
              }
            } catch (error) {
              console.error('Error accepting order:', error);
              Alert.alert('Error', 'Failed to accept order. Please try again.');
            }
          },
        },
      ],
    );
  };

  const handleStatusUpdate = async newStatus => {
    // Direct status update without notes modal
    await updateStatusWithNotes(newStatus, '');
  };

  const updateStatusWithNotes = async (status, notes) => {
    if (!currentOrder?.id) {
      Alert.alert('Error', 'Order ID not found');
      return;
    }

    try {
      const result = await updateOrderStatus(status, notes);
      if (result.success) {
        if (status === 'delivered') {
          navigation.navigate('Delivery');
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'Failed to update order status. Please try again.');
    }
  };

  const handleCall = phoneNumber => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Phone number not available');
      return;
    }
    Linking.openURL(`tel:${phoneNumber}`).catch(error => {
      console.error('Error opening phone dialer:', error);
      Alert.alert('Error', 'Failed to open phone dialer');
    });
  };

  const getStatusButtons = () => {
    if (!currentOrder) return [];
    const status = currentOrder?.status;

    switch (status) {
      case 'pending':
      case 'assigned':
        return [
          {
            title: 'Accept Order',
            onPress: handleAcceptOrder,
            icon: 'check-circle',
            color: '#10b981',
          },
        ];
      case 'confirmed':
        return [
          {
            title: 'Heading to Customer',
            onPress: () => handleStatusUpdate('out_for_delivery'),
            icon: 'directions',
            color: '#035db7',
          },
        ];
      case 'out_for_delivery':
        return [
          {
            title: 'Deliver Order',
            onPress: () => navigation.navigate('Delivery'),
            icon: 'check-circle',
            color: '#10b981',
          },
        ];
      default:
        return [];
    }
  };

  // No "No active order" screen - screen will render with empty/default values
  // No error screens - screen will render with empty/default values if currentOrder is null

  const capitalizeFirstLetter = text => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  };
  const truncateText = (text, maxLength = 15) => {
    if (!text) return '';
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {currentOrder?.orderNumber || `Order #${truncateText(currentOrder?.id || '', 18)}` || 'Order Details'}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.mapContainer}>
        {mapRegion && (
          <MapView
            style={styles.map}
            region={mapRegion}
            showsUserLocation
            mapType="standard"
            ref={mapRef}
          >
            {currentLocation && (
              // <Marker
              //   provider={PROVIDER_GOOGLE}
              //   coordinate={currentLocation}
              //   title="Your Location"
              //   // pinColor="blue"
              //   rotation={heading} // <-- car direction rotation
              //   image={require('../assets/car.png')}
              // />
              <Marker
                coordinate={currentLocation}
                anchor={{ x: 0.5, y: 0.5 }}
                flat={true}
                // rotation={heading}
              >
                <View style={{ transform: [{ rotate: `deg` }] }}>
                 <AntDesign name="car" size={24} color="red" />

                </View>
              </Marker>
            )}

            {getCurrentDestination() && (
              <Marker
                coordinate={getCurrentDestination()}
                title="Customer Address"
                pinColor="red"
              />
            )}

            {currentLocation && getCurrentDestination() && (
              <MapViewDirections
                origin={currentLocation}
                destination={getCurrentDestination()}
                apikey="AIzaSyBtb6hSmwJ9_OznDC5e8BcZM90ms4WD_DE"
                strokeWidth={3}
                strokeColor="#030213"
                optimizeWaypoints={true}
                onReady={result => {
                  mapRef.current.fitToCoordinates(result.coordinates, {
                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                    animated: true,
                  });
                }}
              />
            )}
          </MapView>
        )}

        <View style={styles.mapOverlay}>
          <View style={styles.etaContainer}>
            <Icon name="access-time" size={16} color="#030213" />
            <Text style={styles.etaText}>{eta || 'Calculating...'}</Text>
          </View>
          {route && route.distance && (
            <View style={styles.distanceContainer}>
              <Icon name="straighten" size={16} color="#030213" />
              <Text style={styles.distanceText}>{route.distance}</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.detailsContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.orderInfo}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Order ID:</Text>
            <Text style={styles.value}>{currentOrder?.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Order Number:</Text>
            <Text style={styles.value}>{currentOrder?.orderNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Customer:</Text>
            <Text style={styles.value}>
              {capitalizeFirstLetter(currentOrder?.customerName)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Customer Phone:</Text>
            <Text style={styles.value}>{currentOrder?.customerPhone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Payment Method:</Text>
            <Text style={styles.value}>
              {currentOrder?.paymentMethod ? currentOrder.paymentMethod.replace(/_/g, ' ').toUpperCase() : 'N/A'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Payment Status:</Text>
            <Text
              style={[
                styles.value,
                currentOrder?.paymentStatus === 'pending'
                  ? styles.pendingStatus
                  : styles.completedStatus,
              ]}
            >
              {currentOrder?.paymentStatus ? currentOrder.paymentStatus.toUpperCase() : 'N/A'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Total Amount:</Text>
            <Text style={styles.value}>KSH{currentOrder?.totalAmount || '0'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Status:</Text>
            <Text style={[styles.value, styles.status]}>
              {currentOrder?.status ? currentOrder.status.replace(/_/g, ' ').toUpperCase() : 'N/A'}
            </Text>
          </View>
          {currentOrder?.adminNotes && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Admin Notes:</Text>
              <Text style={styles.value}>{currentOrder?.adminNotes || 'N/A'}</Text>
            </View>
          )}
        </View>

        {/* Order Items */}
        {currentOrder?.items && currentOrder?.items.length > 0 && (
          <View style={styles.itemsSection}>
            <Text style={styles.sectionTitle}>Order Items</Text>
            {currentOrder?.items.map((item, index) => (
              <View key={index} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>
                    {capitalizeFirstLetter(item?.productName)}
                  </Text>
                  <Text style={styles.itemTotal}>KSH{item?.total}</Text>
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemVariant}>{item?.variantLabel}</Text>
                  <Text style={styles.itemQuantity}>Qty: {item?.quantity}</Text>
                  <Text style={styles.itemPrice}>
                    KSH{item?.variantPrice} each
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {currentOrder?.customerAddress && (
          <View style={styles.addressSection}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <View style={styles.addressCard}>
              <Icon name="location-on" size={20} color="#030213" />
              <Text style={styles.addressText}>
                {currentOrder?.customerAddress || 'N/A'}
              </Text>
            </View>
          </View>
        )}

        {currentOrder?.customerPhone && (
          <View style={styles.contactSection}>
            <Text style={styles.sectionTitle}>Contact Customer</Text>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => handleCall(currentOrder?.customerPhone)}
            >
              <Icon name="phone" size={20} color="#ffffff" />
              <Text style={styles.callButtonText}>
                Call {capitalizeFirstLetter(currentOrder?.customerName || 'Customer')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.actionsSection}>
          {getStatusButtons().map((button, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionButton, { backgroundColor: button.color }]}
              onPress={button.onPress}
            >
              <Icon name={button.icon} size={20} color="#ffffff" />
              <Text style={styles.actionButtonText}>{button.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: spacing.xl,
    // minHeight: hp(14),
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: '#ffffff', // White text
  },
  headerRight: {
    width: wp('10%'),
  },
  mapContainer: {
    height: 250,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
  },
  etaText: {
    marginLeft: spacing.xs,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#030213',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
    marginTop: spacing.sm,
  },
  distanceText: {
    marginLeft: spacing.xs,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#030213',
  },
  detailsContainer: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  orderInfo: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: COLORS.blue,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ebef',
  },
  label: {
    fontSize: fontSize.sm,
    color: '#717182',
  },
  value: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: '#030213',
  },
  status: {
    color: COLORS.blue,
  },
  addressSection: {
    marginTop: spacing.xl,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f3f5',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  addressText: {
    marginLeft: spacing.sm,
    fontSize: fontSize.sm,
    color: '#030213',
    flex: 1,
  },
  contactSection: {
    marginTop: 24,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    width: '100%',
    marginBottom: spacing.sm,
  },
  callButtonText: {
    marginLeft: spacing.sm,
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#ffffff',
  },
  actionsSection: {
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  actionButtonText: {
    marginLeft: spacing.sm,
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    margin: spacing.lg,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#030213',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: fontSize.sm,
    color: '#717182',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#e9ebef',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.sm,
    color: '#030213',
    backgroundColor: '#f9f9f9',
    marginBottom: spacing.lg,
    minHeight: 100,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.xs,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  confirmButton: {
    backgroundColor: '#10b981',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: fontSize.md,
    fontWeight: '500',
    textAlign: 'center',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: fontSize.md,
    fontWeight: '600',
    textAlign: 'center',
  },
  itemsSection: {
    marginTop: spacing.xl,
  },
  itemCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.blue,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  itemName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#030213',
    flex: 1,
  },
  itemTotal: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: COLORS.blue,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemVariant: {
    fontSize: fontSize.sm,
    color: '#717182',
    backgroundColor: '#e9ebef',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  itemQuantity: {
    fontSize: fontSize.sm,
    color: '#717182',
  },
  itemPrice: {
    fontSize: fontSize.sm,
    color: '#717182',
  },
  agentSection: {
    marginTop: spacing.xl,
  },
  agentCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: '#035db7',
  },
  pendingStatus: {
    color: '#f59e0b',
  },
  completedStatus: {
    color: '#10b981',
  },
});

export default OrderDetailScreen;
