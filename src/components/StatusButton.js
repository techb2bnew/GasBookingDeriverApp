import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { wp, hp, fontSize, spacing, borderRadius } from '../utils/dimensions';
import Icon from 'react-native-vector-icons/MaterialIcons';

const StatusButton = ({title, icon, onPress, disabled = false, color = '#035db7'}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button, 
        { backgroundColor: color },
        disabled && styles.buttonDisabled
      ]}
      onPress={onPress}
      disabled={disabled}>
      <Icon 
        name={icon} 
        size={20} 
        color={disabled ? '#6b7280' : '#ffffff'} 
      />
      <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: spacing.md,
    marginBottom: spacing.md,
  },
  buttonDisabled: {
    backgroundColor: '#f3f4f6', // Light background
  },
  buttonText: {
    marginLeft: spacing.sm,
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#ffffff', // White text
  },
  buttonTextDisabled: {
    color: '#6b7280', // Gray text
  },
});

export default StatusButton;