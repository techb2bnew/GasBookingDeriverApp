import React, { createContext, useContext, useReducer, useRef } from 'react';
import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { locationService } from '../services/locationService';

const LocationContext = createContext();

const initialState = {
  currentLocation: null,
  isTracking: false,
  route: null,
  eta: null,
};

const locationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CURRENT_LOCATION':
      return { ...state, currentLocation: action.payload };
    case 'SET_TRACKING':
      return { ...state, isTracking: action.payload };
    case 'SET_ROUTE':
      return { ...state, route: action.payload };
    case 'SET_ETA':
      return { ...state, eta: action.payload };
    default:
      return state;
  }
};

export const LocationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(locationReducer, initialState);
  const watchIdRef = useRef(null);

  // ---------- PERMISSION ----------
  const ensurePermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "This app needs access to your location.",
            buttonPositive: "OK"
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert("Permission Denied", "Location permission is required.");
          return false;
        }
        return true;
      } else {
        // iOS: configure and trigger the system prompt
        Geolocation.setRNConfiguration({
          skipPermissionRequests: false,
          authorizationLevel: 'whenInUse',
        });
        
        // Request authorization
        Geolocation.requestAuthorization();
        
        // Check permission by trying to get current position with a short timeout
        return new Promise((resolve) => {
          Geolocation.getCurrentPosition(
            () => {
              // Permission granted - location retrieved successfully
              resolve(true);
            },
            (error) => {
              // Permission denied or location unavailable
              if (error.code === 1) { // PERMISSION_DENIED
                Alert.alert(
                  "Location Permission Required",
                  "Please enable location access in Settings to use this feature.",
                  [
                    { text: "Cancel", style: "cancel" },
                    { 
                      text: "Open Settings", 
                      onPress: () => Linking.openURL('app-settings:')
                    }
                  ]
                );
                resolve(false);
              } else {
                // Other errors (timeout, unavailable) - still allow but warn
                console.warn("Location permission check warning:", error);
                resolve(true); // Allow to proceed, error will be handled later
              }
            },
            { timeout: 3000, maximumAge: 0 }
          );
        });
      }
    } catch (e) {
      console.error("ensurePermission error:", e);
      return false;
    }
  };

  // ---------- ONE-SHOT LOCATION ----------
  const getCurrentLocation = async () => {
    const ok = await ensurePermission();
    if (!ok) return;

    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        dispatch({
          type: "SET_CURRENT_LOCATION",
          payload: { latitude, longitude },
        });
      },
      (error) => {
        console.error("getCurrentLocation error:", error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // ---------- START TRACKING ----------
  const startLocationTracking = async () => {
    console.log("startLocationTracking called");
    
    if (watchIdRef.current) {
      console.log("Already tracking");
      return;
    }

    const ok = await ensurePermission();
    if (!ok) {
      // Ensure UI reflects that tracking did not start
      dispatch({ type: "SET_TRACKING", payload: false });
      return;
    }

    try {
      // Immediately reflect Online state in UI for a more responsive toggle (iOS + Android)
      dispatch({ type: "SET_TRACKING", payload: true });

      // First get current position
      Geolocation.getCurrentPosition(
        (position) => {
          console.log("✅ Initial location access working:", position);
          dispatch({
            type: "SET_CURRENT_LOCATION",
            payload: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            },
          });
          console.log("✅ Tracking started - Online");
        },
        (error) => {
          console.error("❌ Initial location access failed:", error);
          
          // Handle different error codes
          if (error.code === 1) { // PERMISSION_DENIED
            dispatch({ type: "SET_TRACKING", payload: false });
            Alert.alert(
              "Location Permission Denied",
              "Location access is required for tracking. Please enable it in Settings.",
              [
                { text: "Cancel", style: "cancel" },
                { 
                  text: "Open Settings", 
                  onPress: () => {
                    if (Platform.OS === 'ios') {
                      Linking.openURL('app-settings:');
                    } else {
                      Linking.openSettings();
                    }
                  }
                }
              ]
            );
          } else if (error.code === 2) { // POSITION_UNAVAILABLE
            console.warn("Location unavailable - GPS may be disabled or weak signal");
            dispatch({ type: "SET_TRACKING", payload: false });
            
            const isSimulator = Platform.OS === 'ios' && __DEV__;
            const message = isSimulator
              ? "Location services are not available. Please configure a location in the iOS Simulator:\n\nFeatures → Location → Custom Location (or select a preset)"
              : "Unable to get your location. Please check:\n\n• GPS is enabled\n• Location services are turned on\n• You're in an area with good GPS signal";
            
            Alert.alert(
              "Location Unavailable",
              message,
              [
                { text: "OK", style: "default" },
                ...(Platform.OS === 'ios' && !isSimulator ? [{
                  text: "Open Settings",
                  onPress: () => Linking.openURL('app-settings:')
                }] : [])
              ]
            );
          } else if (error.code === 3) { // TIMEOUT
            console.warn("Location request timed out");
            dispatch({ type: "SET_TRACKING", payload: false });
            Alert.alert(
              "Location Timeout",
              "Location request took too long. Please try again or check your GPS signal.",
              [{ text: "OK" }]
            );
          } else {
            // For other errors, roll back tracking
            dispatch({ type: "SET_TRACKING", payload: false });
            console.warn("Unknown location error:", error);
          }
        },
        { enableHighAccuracy: Platform.OS === 'ios', timeout: 15000, maximumAge: 5000 }
      );

      // Start continuous tracking
      watchIdRef.current = Geolocation.watchPosition(
        (position) => {
          console.log("📍 Location update:", position.coords);
          dispatch({
            type: "SET_CURRENT_LOCATION",
            payload: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            },
          });
        },
        (error) => {
          console.error("❌ Watch position error:", error);
          
          // Handle different error codes
          if (error.code === 1) { // PERMISSION_DENIED
            console.error("Location permission denied");
            stopLocationTracking();
            Alert.alert(
              "Location Permission Denied",
              "Location access is required for tracking. Please enable it in Settings.",
              [
                { text: "Cancel", style: "cancel" },
                { 
                  text: "Open Settings", 
                  onPress: () => {
                    if (Platform.OS === 'ios') {
                      Linking.openURL('app-settings:');
                    } else {
                      Linking.openSettings();
                    }
                  }
                }
              ]
            );
          } else if (error.code === 2) { // POSITION_UNAVAILABLE
            console.warn("Location unavailable - GPS may be disabled or weak signal");
            // Don't stop tracking immediately, just log the warning
            // User might move to a better location
          } else if (error.code === 3) { // TIMEOUT
            console.warn("Location request timed out");
            // Don't stop tracking immediately, just log the warning
          }
        },
        {
          enableHighAccuracy: Platform.OS === 'ios',
          distanceFilter: 10,
          interval: Platform.OS === 'android' ? 5000 : undefined
        }
      );

    } catch (e) {
      console.error("Even simple location failed:", e);
      // Roll back to Offline on hard failures
      dispatch({ type: "SET_TRACKING", payload: false });
    }
  };

  // ---------- STOP TRACKING ----------
  const stopLocationTracking = () => {
    try {
      if (watchIdRef.current !== null) {
        Geolocation.clearWatch(watchIdRef.current);
        Geolocation.stopObserving(); // ✅ ये भी जरूरी है crash avoid करने के लिए
        watchIdRef.current = null;
      }
    } catch (e) {
      console.error("stopLocationTracking error:", e);
    } finally {
      dispatch({ type: "SET_TRACKING", payload: false });
      console.log("Tracking stopped ⛔");
    }
  };

  // ---------- ROUTE MOCK ----------
  const getRoute = async (destination) => {
    if (!state.currentLocation) return;
    try {
      const routeData = await locationService.getRoute(state.currentLocation, destination);
      dispatch({ type: "SET_ROUTE", payload: routeData.route });
      dispatch({ type: "SET_ETA", payload: routeData.eta });
    } catch (error) {
      console.error("Route error:", error);
    }
  };

  return (
    <LocationContext.Provider
      value={{
        ...state,
        getCurrentLocation,
        startLocationTracking,
        stopLocationTracking,
        getRoute,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within LocationProvider");
  return ctx;
};
