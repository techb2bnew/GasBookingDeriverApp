import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { wp, hp, fontSize, spacing, borderRadius } from '../utils/dimensions';

const CurrentOrderBanner = ({ order, onPress }) => {
  const getStatusInfo = () => {
    switch (order.status) {
      case 'accepted':
        return {
          text: 'Head to Gas Station',
          icon: 'local-gas-station',
          color: '#3b82f6',
        };
      case 'heading_to_gas_station':
        return {
          text: 'Heading to Gas Station',
          icon: 'local-gas-station',
          color: '#3b82f6',
        };
      case 'at_gas_station':
        return {
          text: 'At Gas Station',
          icon: 'local-gas-station',
          color: '#f59e0b',
        };
      case 'picked_up':
        return {
          text: 'Gas Picked Up',
          icon: 'shopping-bag',
          color: '#8b5cf6',
        };
      case 'heading_to_customer':
        return {
          text: 'Heading to Customer',
          icon: 'directions',
          color: '#3b82f6',
        };
      default:
        return {
          text: 'Order Active',
          icon: 'local-shipping',
          color: '#10b981',
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <View style={[styles.statusIcon, { backgroundColor: statusInfo.color }]}>
            <Icon name={statusInfo.icon} size={20} color="#ffffff" />
          </View>
          <View style={styles.orderInfo}>
            <Text style={styles.statusText}>{statusInfo.text}</Text>
            <Text style={styles.orderId}>Order #{order.id}</Text>
          </View>
        </View>
        <View style={styles.rightSection}>
          <Icon name="chevron-right" size={24} color="#717182" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff', // White background
    borderRadius: spacing.md,
    padding: spacing.lg,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    shadowColor: '#1f2937', // Dark shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: spacing.xs,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  orderInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#1f2937', // Dark text
    marginBottom: 2,
  },
  orderId: {
    fontSize: fontSize.sm,
    color: '#6b7280', // Gray text
  },
  rightSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CurrentOrderBanner;