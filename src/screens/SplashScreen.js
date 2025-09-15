import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { wp, hp, fontSize, spacing, borderRadius } from '../utils/dimensions';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto finish after 5 seconds
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#1e293b" barStyle="light-content" />
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim },
            ],
          },
        ]}
      >
        {/* Logo Container */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBackground}>
            <Icon name="local-shipping" size={80} color="#ffffff" />
          </View>
        </View>

        {/* App Name */}
        <Text style={styles.appName}>Gas Driver</Text>
        
        {/* Tagline */}
        <Text style={styles.tagline}>Fast & Reliable Gas Delivery</Text>

        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDots}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </View>

        {/* Company Info */}
        <View style={styles.companyInfo}>
          <Text style={styles.companyText}>Powered by GasDriver</Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e293b', // Dark slate background
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: spacing.xxl,
  },
  logoBackground: {
    width: wp('30%'),
    height: wp('30%'),
    borderRadius: wp('15%'),
    backgroundColor: '#3b82f6', // Blue
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  appName: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  tagline: {
    fontSize: fontSize.md,
    color: '#94a3b8', // Light slate
    marginBottom: spacing.xxl,
    textAlign: 'center',
  },
  loadingContainer: {
    marginBottom: spacing.xxl,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: wp('2%'),
    height: wp('2%'),
    borderRadius: wp('1%'),
    backgroundColor: '#3b82f6', // Blue
    marginHorizontal: spacing.xs,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  companyInfo: {
    alignItems: 'center',
  },
  companyText: {
    fontSize: fontSize.sm,
    color: '#64748b', // Slate gray
    marginBottom: spacing.xs,
  },
  versionText: {
    fontSize: fontSize.xs,
    color: '#64748b', // Slate gray
  },
});

export default SplashScreen;
