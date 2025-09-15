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
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useOrder } from '../context/OrderContext';
import { useLocation } from '../context/LocationContext';
import StatusButton from '../components/StatusButton';
import MapViewDirections from 'react-native-maps-directions';
import { fontSize, spacing, borderRadius,wp,hp } from '../utils/dimensions';


const OrderDetailScreen = ({ navigation }) => {
  const { currentOrder, updateOrderStatus, acceptOrder } = useOrder();
  const { currentLocation, route, eta, getRoute } = useLocation();
  const [mapRegion, setMapRegion] = useState(null);

  const mapRef = useRef(null);

  useEffect(() => {
    if (currentOrder && currentLocation) {
      const destination = getCurrentDestination();
      if (destination) {
        getRoute(destination);

        // Set map region to include both current location and destination
        const midLat = (currentLocation.latitude + destination.latitude) / 2;
        const midLng = (currentLocation.longitude + destination.longitude) / 2;
        const latDelta = Math.abs(currentLocation.latitude - destination.latitude) * 1.5;
        const lngDelta = Math.abs(currentLocation.longitude - destination.longitude) * 1.5;

        setMapRegion({
          latitude: midLat,
          longitude: midLng,
          latitudeDelta: Math.max(latDelta, 0.01),
          longitudeDelta: Math.max(lngDelta, 0.01),
        });
      }
    }
  }, [currentOrder, currentLocation]);

  const getCurrentDestination = () => {
    if (!currentOrder) return null;

    const status = currentOrder.status;
    if (status === 'pending' || status === 'accepted' || status === 'heading_to_gas_station') {
      return currentOrder.gasStation.location;
    } else if (status === 'picked_up' || status === 'heading_to_customer') {
      return currentOrder.customer.location;
    }
    return null;
  };

  const getCurrentAddress = () => {
    if (!currentOrder) return '';

    const status = currentOrder.status;
    if (status === 'pending' || status === 'accepted' || status === 'heading_to_gas_station') {
      return currentOrder.gasStation.address;
    } else if (status === 'picked_up' || status === 'heading_to_customer') {
      return currentOrder.customer.address;
    }
    return '';
  };

  const handleAcceptOrder = async () => {
    Alert.alert(
      'Accept Order',
      'Are you sure you want to accept this gas delivery order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            const result = await acceptOrder(currentOrder.id);
            if (result.success) {
              Alert.alert('Success', 'Order accepted successfully!');
            } else {
              Alert.alert('Error', 'Failed to accept order');
            }
          },
        },
      ]
    );
  };

  const handleStatusUpdate = async (newStatus) => {
    const result = await updateOrderStatus(newStatus);
    if (result.success) {
      if (newStatus === 'delivered') {
        navigation.navigate('Delivery');
      }
    } else {
      Alert.alert('Error', 'Failed to update order status');
    }
  };



  const handleCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const getStatusButtons = () => {
    const status = currentOrder?.status;

    switch (status) {
      case 'pending':
        return [
          {
            title: 'Accept Order',
            onPress: handleAcceptOrder,
            icon: 'check-circle',
            color: '#10b981',
          },
        ];
      case 'accepted':
        return [
          {
            title: 'Heading to Gas Station',
            onPress: () => handleStatusUpdate('heading_to_gas_station'),
            icon: 'directions',
            color: '#3b82f6',
          },
        ];
      case 'heading_to_gas_station':
        return [
          {
            title: 'Reached Gas Station',
            onPress: () => handleStatusUpdate('at_gas_station'),
            icon: 'local-gas-station',
            color: '#f59e0b',
          },
        ];
      case 'at_gas_station':
        return [
          {
            title: 'Gas Picked Up',
            onPress: () => handleStatusUpdate('picked_up'),
            icon: 'shopping-bag',
            color: '#8b5cf6',
          },
        ];
      case 'picked_up':
        return [
          {
            title: 'Heading to Customer',
            onPress: () => handleStatusUpdate('heading_to_customer'),
            icon: 'directions',
            color: '#3b82f6',
          },
        ];
      case 'heading_to_customer':
        return [
          {
            title: 'Deliver Gas',
            onPress: () => handleStatusUpdate('delivered'),
            icon: 'check-circle',
            color: '#10b981',
          },
        ];
      default:
        return [];
    }
  };

  if (!currentOrder) {
    return (
      <View style={styles.container}>
        <Text>No active order</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#030213" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #{currentOrder.id}</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.mapContainer}>
        {mapRegion && (
          <MapView style={styles.map} region={mapRegion} showsUserLocation mapType="standard" ref={mapRef}
          >
            {currentLocation && (
              <Marker
                provider={PROVIDER_GOOGLE}
                coordinate={currentLocation}
                title="Your Location"
                pinColor="blue"
              />
            )}

            {getCurrentDestination() && (
              <Marker
                coordinate={getCurrentDestination()}
                title={getCurrentAddress()}
                pinColor="red"
              />
            )}

            {currentLocation && getCurrentDestination() && (
              <MapViewDirections
                origin={currentLocation}
                destination={getCurrentDestination()}
                apikey="AIzaSyBXNyT9zcGdvhAUCUEYTm6e_qPw26AOPgI"
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
        </View>
      </View>

      <ScrollView style={styles.detailsContainer}>
                    <View style={styles.orderInfo}>
              <Text style={styles.sectionTitle}>Order Details</Text>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Gas Station:</Text>
                <Text style={styles.value}>{currentOrder.gasStation.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Customer:</Text>
                <Text style={styles.value}>{currentOrder.customer.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Gas Type:</Text>
                <Text style={styles.value}>{currentOrder.gasType}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Quantity:</Text>
                <Text style={styles.value}>{currentOrder.quantity} cylinders</Text>
              </View>
              {currentOrder.accessories && currentOrder.accessories.length > 0 && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Accessories:</Text>
                  <Text style={styles.value}>{currentOrder.accessories.join(', ')}</Text>
                </View>
              )}
              <View style={styles.infoRow}>
                <Text style={styles.label}>Total:</Text>
                <Text style={styles.value}>₹{currentOrder.total}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Status:</Text>
                <Text style={[styles.value, styles.status]}>
                  {currentOrder.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>

        <View style={styles.addressSection}>
          <Text style={styles.sectionTitle}>Destination</Text>
          <View style={styles.addressCard}>
            <Icon name="location-on" size={20} color="#030213" />
            <Text style={styles.addressText}>{getCurrentAddress()}</Text>
          </View>
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => handleCall(currentOrder.customer.phone)}>
            <Icon name="phone" size={20} color="#ffffff" />
            <Text style={styles.callButtonText}>Call Customer</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsSection}>
          {getStatusButtons().map((button, index) => (
            <StatusButton
              key={index}
              title={button.title}
              icon={button.icon}
              onPress={button.onPress}
              color={button.color}
            />
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
    paddingHorizontal: spacing.md,
    paddingVertical: 5
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#1f2937', // Dark text
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
    color: '#030213',
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
    color: '#10b981',
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
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 12,
  },
  callButtonText: {
    marginLeft: spacing.sm,
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#ffffff',
  },
  actionsSection: {
    marginTop: spacing.xl,
        marginBottom: spacing.xxl,
  },
});

export default OrderDetailScreen;