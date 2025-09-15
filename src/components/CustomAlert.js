import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { wp, hp, fontSize, spacing, borderRadius } from '../utils/dimensions';

const CustomAlert = ({
  visible,
  title,
  message,
  type = 'info', // 'info', 'success', 'warning', 'error'
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  showCancel = true,
}) => {
  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'check-circle',
          color: '#10b981',
          backgroundColor: '#ecfdf5',
        };
      case 'warning':
        return {
          icon: 'warning',
          color: '#f59e0b',
          backgroundColor: '#fffbeb',
        };
      case 'error':
        return {
          icon: 'error',
          color: '#ef4444',
          backgroundColor: '#fef2f2',
        };
      default:
        return {
          icon: 'info',
          color: '#3b82f6',
          backgroundColor: '#eff6ff',
        };
    }
  };

  const { icon, color, backgroundColor } = getIconAndColor();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <View style={[styles.iconContainer, { backgroundColor }]}>
            <Icon name={icon} size={32} color={color} />
          </View>
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonContainer}>
            {showCancel && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                styles.button, 
                styles.confirmButton,
                { backgroundColor: color },
                !showCancel && { flex: 1 }
              ]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  alertContainer: {
    backgroundColor: '#ffffff',
    borderRadius: spacing.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: wp('80%'),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: spacing.md,
    elevation: 8,
  },
  iconContainer: {
    width: wp('16%'),
    height: wp('16%'),
    borderRadius: wp('8%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: fontSize.sm,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: spacing.sm,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  confirmButton: {
    backgroundColor: '#3b82f6',
  },
  cancelButtonText: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: '#374151',
  },
  confirmButtonText: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: '#ffffff',
  },
});

export default CustomAlert;
