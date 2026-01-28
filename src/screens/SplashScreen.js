import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { wp, hp, fontSize, spacing, borderRadius } from '../utils/dimensions';
import { COLORS } from '../utils/constants';

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
          {/* <View style={{ alignItems: 'center'}}> */}
            <Image source={require('../assets/leadIcon.png')} style={styles.logoImage} />
          {/* </View> */}
          </View>
        </View>

        {/* App Name */}
        {/* <Text style={styles.appName}>LEADWAY GAS</Text> */}
        
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
          <Text style={styles.companyText}>Powered by Leadway Gas</Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white', // Dark slate background
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
  logoContainer: {
    // backgroundColor: 'white', // 👈 yahin white background
    // borderRadius: 50, // optional
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    padding:2,
    color: '#ffffff',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  tagline: {
    fontSize: fontSize.md,
    color: COLORS.blue, // Light slate
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
    backgroundColor: COLORS.blue, // Blue
    marginHorizontal: spacing.xs,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  logoImage: {
    width: 170,
    height: 150,
  },
  dot3: {
    opacity: 1,
  },
  companyInfo: {
    alignItems: 'center',
  },
  companyText: {
    fontSize: fontSize.sm,
    color: COLORS.blue, // Slate gray
    marginBottom: spacing.xs,
  },
  versionText: {
    fontSize: fontSize.xs,
    color: COLORS.blue, // Slate gray
  },
});

export default SplashScreen;
