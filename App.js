import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { OrderProvider } from './src/context/OrderContext';
import { LocationProvider } from './src/context/LocationContext';
import { SocketProvider } from './src/context/SocketContext';

import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import OrderDetailScreen from './src/screens/OrderDetailScreen';
import DeliveryScreen from './src/screens/DeliveryScreen';
import NotificationScreen from './src/screens/NotificationScreen';

import ProfileScreen from './src/screens/ProfileScreen';
import OrderHistoryScreen from './src/screens/OrderHistoryScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import HelpSupportScreen from './src/screens/HelpSupportScreen';
import AboutUsScreen from './src/screens/AboutUsScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from './src/screens/TermsOfServiceScreen';
import DriverAgreementScreen from './src/screens/DriverAgreementScreen';
import ActiveOrdersScreen from './src/screens/ActiveOrdersScreen';
import { borderRadius, fontSize, spacing } from './src/utils/dimensions';
import { COLORS } from './src/utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import messaging from '@react-native-firebase/messaging';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let iconName;
        if (route.name === 'Dashboard') {
          iconName = 'dashboard';
        } else if (route.name === 'Profile') {
          iconName = 'person';
        } else if (route.name === 'Notification') {
          iconName = 'notifications';
        } else if (route.name === 'History') {
          iconName = 'history';
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.8}
            style={styles.tabItem}
          >
            <View
              style={[styles.tabContent, isFocused && styles.tabContentActive]}
            >
              <Icon
                name={iconName}
                size={24}
                color={isFocused ? '#ffffff' : COLORS.blue}
              />
              <Text
                style={[styles.tabLabel, isFocused && styles.tabLabelActive]}
              >
                {label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: Platform.OS === 'ios' ? 12 : 10,
    paddingVertical: 10,
    borderRadius: 28,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 10,
  },

  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 22,
    minWidth: 78,
  },
  tabContentActive: {
    backgroundColor: COLORS.primary,
    borderRadius: borderRadius.xl,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    color: COLORS.blue,
  },

  tabLabelActive: {
    color: '#fff',
    fontWeight: '700',
  },
});

const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="History" component={OrderHistoryScreen} />
      <Tab.Screen name="Notification" component={NotificationScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
};

const AppStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="Delivery" component={DeliveryScreen} />
      <Stack.Screen name="ActiveOrders" component={ActiveOrdersScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="AboutUs" component={AboutUsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
      <Stack.Screen name="DriverAgreement" component={DriverAgreementScreen} />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer
      theme={{
        colors: {
          background: '#ffffff',
        },
      }}
    >
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  // useEffect(() => {
  //   const requestPermissions = async () => {
  //     if (Platform.OS === 'ios') {
  //       await requestUserIosPermission();
  //     } else {
  //       await requestNotificationPermission();
  //     }
  //   };
  //   requestPermissions();
  // }, []);
  useEffect(() => {
    // Request location permission when app starts
    // requestLocationPermission();
  }, []);
  const requestNotificationPermission = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'This app would like to send you notifications.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          },
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getFcmToken();
          console.log('Notification permission granted');
        } else {
          console.log('Notification permission denied');
          Alert.alert(
            'Permission Denied',
            'You will not receive notifications.',
          );
        }
      } catch (err) {
        console.warn('Permission error:', err);
      }
    }
  };
  // const requestUserIosPermission = async () => {
  //   const authStatus = await messaging().requestPermission();
  //   const enabled =
  //     authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //     authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  //   if (enabled) {
  //     console.log('iOS Notification permission granted:', authStatus);
  //     getFcmToken();
  //   } else {
  //     console.log('iOS Notification permission denied:', authStatus);
  //   }
  // };

  useEffect(() => {
    // const unsubscribe = messaging().onMessage(async remoteMessage => {
    //   Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    // });
    // return unsubscribe;
  }, []);

  const getFcmToken = async () => {
    try {
      const existingToken = await AsyncStorage.getItem('fcmToken');
      if (existingToken) {
        console.log('FCM token (from storage):', existingToken);
        return existingToken;
      }

      const token = await messaging().getToken();
      console.log('fcmtoken>>', token);

      if (token) {
        await AsyncStorage.setItem('fcmToken', token);
        return token;
      }
    } catch (error) {
      console.log('Error getting FCM token:', error);
    }
  };
  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      {/* <SafeAreaView
        style={{ flex: 1, backgroundColor: '#ffffff' }}
        edges={['top', 'left', 'right']}
      > */}
        <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
          <AuthProvider>
            <AppWithSocket />
          </AuthProvider>
        </View>
      {/* </SafeAreaView> */}
    </SafeAreaProvider>
  );
};

// Separate component to access auth context for socket
const AppWithSocket = () => {
  const { isAuthenticated } = useAuth();

  return (
    <SocketProvider isAuthenticated={isAuthenticated}>
      <LocationProvider>
        <OrderProvider>
          <AppNavigator />
          <Toast />
        </OrderProvider>
      </LocationProvider>
    </SocketProvider>
  );
};

export default App;
