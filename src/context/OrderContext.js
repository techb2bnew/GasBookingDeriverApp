import React, {createContext, useContext, useReducer} from 'react';
import {orderService} from '../services/orderService';
import {authService} from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrderContext = createContext();

const initialState = {
  availableOrders: [],
  currentOrder: null,
  orderHistory: [],
  loading: false,
};

const orderReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {...state, loading: action.payload};
    case 'SET_AVAILABLE_ORDERS':
      return {...state, availableOrders: action.payload};
    case 'SET_CURRENT_ORDER':
      return {...state, currentOrder: action.payload};
    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        currentOrder: {
          ...state.currentOrder,
          status: action.payload,
        },
      };
    case 'SET_ORDER_HISTORY':
      return {...state, orderHistory: action.payload};
    case 'COMPLETE_ORDER':
      return {
        ...state,
        currentOrder: null,
        orderHistory: [action.payload, ...state.orderHistory],
      };
    default:
      return state;
  }
};

export const OrderProvider = ({children}) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);

  const fetchAvailableOrders = async (agentStatus = null) => {
    try {
      dispatch({type: 'SET_LOADING', payload: true});
      
      // If agent status is provided and agent is offline, don't fetch orders
      if (agentStatus && agentStatus !== 'online') {
        console.log('Agent is offline, not fetching orders');
        dispatch({type: 'SET_AVAILABLE_ORDERS', payload: []});
        return;
      }
      
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      // Call real API
      const result = await authService.getOrders(token);
      
      if (result.success) {
        // Filter orders that are assigned to current agent and available for delivery
        const availableOrders = result.orders.filter(order => 
          order.status === 'assigned' && 
          order.assignedAgent && 
          order.assignedAgent.id // Assuming we can identify current agent
        );
        dispatch({type: 'SET_AVAILABLE_ORDERS', payload: availableOrders});
      } else {
        console.error('Error fetching orders:', result.error);
        // Fallback to mock data if API fails
        const orders = await orderService.getAvailableOrders();
        dispatch({type: 'SET_AVAILABLE_ORDERS', payload: orders});
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fallback to mock data if API fails
      try {
        const orders = await orderService.getAvailableOrders();
        dispatch({type: 'SET_AVAILABLE_ORDERS', payload: orders});
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    } finally {
      dispatch({type: 'SET_LOADING', payload: false});
    }
  };

  const acceptOrder = async (orderId) => {
    try {
      dispatch({type: 'SET_LOADING', payload: true});
      
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return {success: false, error: 'Authentication token not found'};
      }

      // Call real API
      const result = await authService.acceptOrder(token, orderId);
      
      if (result.success) {
        const order = result.order;
        dispatch({type: 'SET_CURRENT_ORDER', payload: order});
        
        // Remove from available orders
        const updatedOrders = state.availableOrders.filter(o => o.id !== orderId);
        dispatch({type: 'SET_AVAILABLE_ORDERS', payload: updatedOrders});
        
        return {success: true, order};
      } else {
        console.error('Error accepting order:', result.error);
        return {success: false, error: result.error};
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      return {success: false, error: error.message};
    } finally {
      dispatch({type: 'SET_LOADING', payload: false});
    }
  };

  const updateOrderStatus = async (status, agentNotes = '') => {
    try {
      if (!state.currentOrder) {
        return {success: false, error: 'No current order found'};
      }

      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return {success: false, error: 'Authentication token not found'};
      }

      // Call real API
      const result = await authService.updateOrderStatus(token, state.currentOrder.id, status, agentNotes);
      
      if (result.success) {
        const updatedOrder = result.order;
        dispatch({type: 'UPDATE_ORDER_STATUS', payload: status});
        
        // Update the current order with the response data if available
        if (updatedOrder) {
          dispatch({type: 'SET_CURRENT_ORDER', payload: updatedOrder});
        }
        
        return {success: true, order: updatedOrder};
      } else {
        console.error('Error updating order status:', result.error);
        return {success: false, error: result.error};
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      return {success: false, error: error.message};
    }
  };

  const completeOrder = async (deliveryData) => {
    try {
      const completedOrder = await orderService.completeOrder(
        state.currentOrder.id,
        deliveryData
      );
      dispatch({type: 'COMPLETE_ORDER', payload: completedOrder});
      return {success: true};
    } catch (error) {
      console.error('Error completing order:', error);
      return {success: false, error: error.message};
    }
  };

  const setCurrentOrder = (order) => {
    dispatch({type: 'SET_CURRENT_ORDER', payload: order});
  };

  const fetchOrderHistory = async () => {
    try {
      const history = await orderService.getOrderHistory();
      dispatch({type: 'SET_ORDER_HISTORY', payload: history});
    } catch (error) {
      console.error('Error fetching order history:', error);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        ...state,
        fetchAvailableOrders,
        setCurrentOrder,
        acceptOrder,
        updateOrderStatus,
        completeOrder,
        fetchOrderHistory,
      }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within OrderProvider');
  }
  return context;
};