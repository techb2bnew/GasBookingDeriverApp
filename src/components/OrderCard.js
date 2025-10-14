import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { wp, hp, fontSize, spacing, borderRadius } from '../utils/dimensions';

const OrderCard = ({ order, onAccept, buttonText = "Accept Order" }) => {
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate total items quantity
  const totalQuantity = order.items ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  // Get first item for gas type (assuming all items are same type)
  const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;

  // Truncate text to 15 characters
  const truncateText = (text, maxLength = 15) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };
  const handleCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  }
  const capitalizeFirstLetter = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>Order #{truncateText(order?.id, 18)}</Text>
          <Text style={styles.orderTime}>{formatTime(order?.createdAt)}</Text>
        </View>
        <View style={styles.earningsContainer}>
          <Text style={styles.earnings}>₹{order?.totalAmount || '0'}</Text>
          <Text style={styles.earningsLabel}>Total Amount</Text>
        </View>
      </View>

      <View style={styles.customerSection}>
        <View style={styles.customerInfo}>
          <Icon name="person" size={18} color="#030213" />
          <View style={styles.customerDetails}>
            <Text style={styles.customerName}>{truncateText(capitalizeFirstLetter(order?.customerName) || 'Customer')}</Text>
            <Text style={styles.customerAddress}>{order?.customerAddress || 'Address not available'}</Text>
          </View>
        </View>
        <Pressable style={styles.phoneContainer} onPress={() => handleCall(order?.customerPhone)}>
          <Icon name="phone" size={13} color="#035db7" />
          <Text style={styles.phoneText}>{order?.customerPhone || 'N/A'}</Text>
        </Pressable>
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.orderStat}>
          <Text style={styles.statValue}>{totalQuantity}</Text>
          <Text style={styles.statLabel}>Items</Text>
        </View>
        <View style={styles.orderStat}>
          <Text style={styles.statValue}>{capitalizeFirstLetter(firstItem?.productName) || 'Gas'}</Text>
          <Text style={styles.statLabel}>Product</Text>
        </View>
        <View style={styles.orderStat}>
          <Text style={styles.statValue}>{capitalizeFirstLetter(order?.paymentMethod) || 'COD'}</Text>
          <Text style={styles.statLabel}>Payment</Text>
        </View>

      </View>

      <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
        <Text style={styles.acceptButtonText}>{buttonText}</Text>
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
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#10b981',
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
    paddingHorizontal: spacing.sm,
    backgroundColor: '#ffffff',
    borderRadius: spacing.sm,
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: "60%",
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
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: spacing.sm,
    borderRadius: spacing.lg,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  phoneText: {
    fontSize: fontSize.xs,
    color: '#1f2937',
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.md,
  },
  distance: {
    fontSize: fontSize.xs,
    color: '#6b7280',
    marginLeft: 2,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    backgroundColor: '#f8f9fa',
    borderRadius: spacing.md,
    marginVertical: spacing.sm,
  },
  orderStat: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: spacing.sm,
  },
  statValue: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#1f2937', // Dark text
    textAlign: 'center',
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: '#6b7280', // Gray text
    marginTop: 2,
    textAlign: 'center',
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#035db7', // Blue background
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