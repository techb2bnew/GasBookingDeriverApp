import React, {createContext, useContext, useReducer, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {authService} from '../services/authService';

const AuthContext = createContext();

const initialState = {
  isAuthenticated: false,
  user: null,
  loading: true,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({children}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: JSON.parse(userData),
        });
      } else {
        dispatch({type: 'SET_LOADING', payload: false});
      }
    } catch (error) {
      dispatch({type: 'SET_LOADING', payload: false});
    }
  };

  const login = async (email, otp) => {
    try {
      dispatch({type: 'SET_LOADING', payload: true});
      const response = await authService.verifyOtp(email, otp);
      
      if (response.success) {
        await AsyncStorage.setItem('authToken', response.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.user));
        if (response.deliveryAgent) {
          await AsyncStorage.setItem('deliveryAgent', JSON.stringify(response.deliveryAgent));
        }
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: response.user,
        });
        
        return {success: true};
      } else {
        dispatch({type: 'SET_LOADING', payload: false});
        return {success: false, error: response.error || 'Login failed'};
      }
    } catch (error) {
      dispatch({type: 'SET_LOADING', payload: false});
      return {success: false, error: error.message};
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      dispatch({type: 'LOGOUT'});
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (updatedUserData) => {
    try {
      // Here you would typically make an API call to update the user profile
      // For now, we'll just update the local storage and state
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
      dispatch({type: 'UPDATE_USER', payload: updatedUserData});
      return {success: true};
    } catch (error) {
      console.error('Update user error:', error);
      return {success: false, error: error.message};
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        updateUser,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};