import React, { createContext, useContext, useReducer, useRef } from 'react';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
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
      } else {
        // iOS: configure and trigger the system prompt. This API version takes no args.
        Geolocation.setRNConfiguration({
          skipPermissionRequests: false,
          authorizationLevel: 'whenInUse',
        });
        Geolocation.requestAuthorization();
      }
      return true;
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
          // Roll back to Offline if initial location fails on iOS strict permission
          if (Platform.OS === 'ios') {
            dispatch({ type: "SET_TRACKING", payload: false });
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
