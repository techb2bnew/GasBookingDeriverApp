import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { wp, hp, fontSize, spacing, borderRadius } from '../utils/dimensions';

const OrderCard = ({order, onAccept}) => {
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>Order #{order.id}</Text>
          <Text style={styles.orderTime}>{formatTime(order.createdAt)}</Text>
        </View>
        <View style={styles.earningsContainer}>
          <Text style={styles.earnings}>₹{order.deliveryFee}</Text>
          <Text style={styles.earningsLabel}>Delivery Fee</Text>
        </View>
      </View>

      <View style={styles.gasStationSection}>
        <View style={styles.gasStationInfo}>
          <Icon name="local-gas-station" size={18} color="#030213" />
          <View style={styles.gasStationDetails}>
            <Text style={styles.gasStationName}>{order.gasStation.name}</Text>
            <Text style={styles.gasStationAddress}>{order.gasStation.address}</Text>
          </View>
        </View>
        <View style={styles.distanceContainer}>
          <Icon name="location-on" size={14} color="#717182" />
          <Text style={styles.distance}>{order.gasStation.distance}</Text>
        </View>
      </View>

      <View style={styles.customerSection}>
        <View style={styles.customerInfo}>
          <Icon name="person" size={18} color="#030213" />
          <View style={styles.customerDetails}>
            <Text style={styles.customerName}>{order.customer.name}</Text>
            <Text style={styles.customerAddress}>{order.customer.address}</Text>
          </View>
        </View>
        <View style={styles.distanceContainer}>
          <Icon name="location-on" size={14} color="#717182" />
          <Text style={styles.distance}>{order.customer.distance}</Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.orderStat}>
          <Text style={styles.statValue}>{order.quantity}</Text>
          <Text style={styles.statLabel}>Cylinders</Text>
        </View>
        <View style={styles.orderStat}>
          <Text style={styles.statValue}>{order.gasType}</Text>
          <Text style={styles.statLabel}>Gas Type</Text>
        </View>
        <View style={styles.orderStat}>
          <Text style={styles.statValue}>₹{order.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.orderStat}>
          <Text style={styles.statValue}>{order.estimatedTime}</Text>
          <Text style={styles.statLabel}>Est. Time</Text>
        </View>
      </View>



      <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
        <Text style={styles.acceptButtonText}>Accept Order</Text>
        <Icon name="arrow-forward" size={18} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#edededff', // White background
    borderRadius: spacing.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#1f2937', // Dark shadow
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: spacing.sm,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#1f2937', // Dark text
  },
  orderTime: {
    fontSize: fontSize.xs,
    color: '#6b7280', // Gray text
    marginTop: 2,
  },
  earningsContainer: {
    alignItems: 'flex-end',
  },
  earnings: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#10b981', // Green text
  },
  earningsLabel: {
    fontSize: fontSize.xs,
    color: '#6b7280', // Gray text
    marginTop: 2,
  },
  gasStationSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6', // Light background border
  },
  gasStationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  gasStationDetails: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  gasStationName: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: '#1f2937', // Dark text
  },
  gasStationAddress: {
    fontSize: fontSize.xs,
    color: '#6b7280', // Gray text
    marginTop: 2,
  },
  customerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6', // Light background border
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  customerDetails: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  customerName: {
    fontSize: fontSize.sm,
    color: '#1f2937', // Dark text
  },
  customerAddress: {
    fontSize: fontSize.xs,
    color: '#6b7280', // Gray text
    marginTop: 2,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6', // Light background
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.md,
  },
  distance: {
    fontSize: fontSize.xs,
    color: '#6b7280', // Gray text
    marginLeft: 2,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.lg,
  },
  orderStat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#1f2937', // Dark text
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: '#6b7280', // Gray text
    marginTop: 2,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6', // Blue background
    paddingVertical: spacing.md,
    borderRadius: spacing.md,
  },
  acceptButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#ffffff', // White text
    marginRight: spacing.sm,
  },
});

export default OrderCard;