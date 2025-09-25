import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { OrderProvider } from './src/context/OrderContext';
import { LocationProvider } from './src/context/LocationContext';

import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import OrderDetailScreen from './src/screens/OrderDetailScreen';
import DeliveryScreen from './src/screens/DeliveryScreen';
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
        } else if (route.name === 'History') {
          iconName = 'history';
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
          >
            <View style={[
              styles.tabContent,
              isFocused && styles.tabContentActive
            ]}>
              <Icon
                name={iconName}
                size={24}
                color={isFocused ? '#ffffff' : '#64748b'}
              />
              <Text style={[
                styles.tabLabel,
                isFocused && styles.tabLabelActive
              ]}>
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
    borderTopWidth: 0,
    height: 75,
    paddingBottom: spacing.md,
    paddingTop: spacing.md,
    paddingHorizontal: Platform.OS === "ios" ? 0 : spacing.md,
    marginVertical: spacing.sm,
    marginHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    minWidth: 85,
    position: 'relative',
  },
  tabContentActive: {
    backgroundColor: '#3b82f6',
    borderRadius: borderRadius.xl,
  },
  tabLabel: {
    fontSize: Platform.OS === "ios" ? fontSize.sm : fontSize.sm,
    fontWeight: '700',
    marginTop: spacing.sm,
    color: '#64748b',
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
});

const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="History" component={OrderHistoryScreen} />
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

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top', 'left', 'right']}>
        <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
          <AuthProvider>
            <LocationProvider>
              <OrderProvider>
                <AppNavigator />
                <Toast />
              </OrderProvider>
            </LocationProvider>
          </AuthProvider>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default App;