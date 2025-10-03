import React, {createContext, useContext, useReducer, useEffect} from 'react';
import {orderService} from '../services/orderService';
import {authService} from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import {useSocket} from './SocketContext';

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
    case 'ADD_NEW_ORDER':
      // Add new order to available orders if not already present
      const orderExists = state.availableOrders.some(o => o.id === action.payload.id);
      if (orderExists) {
        return state;
      }
      return {
        ...state,
        availableOrders: [action.payload, ...state.availableOrders],
      };
    case 'UPDATE_ORDER_IN_LIST':
      // Update order in available orders or current order
      const updatedOrder = action.payload;
      return {
        ...state,
        availableOrders: state.availableOrders.map(o =>
          o.id === updatedOrder.id ? updatedOrder : o
        ),
        currentOrder: state.currentOrder?.id === updatedOrder.id 
          ? updatedOrder 
          : state.currentOrder,
      };
    case 'REMOVE_ORDER_FROM_LIST':
      // Remove order from available orders
      return {
        ...state,
        availableOrders: state.availableOrders.filter(o => o.id !== action.payload),
      };
    default:
      return state;
  }
};

export const OrderProvider = ({children}) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);
  const {socket, isConnected} = useSocket();

  // Setup Socket.IO event listeners for real-time order updates
  useEffect(() => {
    if (!socket || !isConnected) {
      console.log('⚠️ Socket not connected yet, skipping event listeners setup');
      return;
    }

    console.log('🎧 Setting up Order Socket Listeners...');

    // 🔔 EVENT: order:assigned - When new order is assigned to this agent
    const handleOrderAssigned = async (data) => {
      console.log('📦 ORDER ASSIGNED:', data);
      const orderData = data.data;
      const orderId = orderData.orderId || orderData.id;
      
      try {
        // Fetch complete order details from API
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          const result = await authService.getOrderById(token, orderId);
          if (result.success && result.order) {
            // Use complete order data from API
            const completeOrder = result.order;
            dispatch({type: 'ADD_NEW_ORDER', payload: completeOrder});
            
            console.log('✅ Complete order added to available orders:', completeOrder.orderNumber);
            
            // Show notification
            Toast.show({
              type: 'info',
              text1: 'New Order Assigned! 🎉',
              text2: `Order #${completeOrder.orderNumber} has been assigned to you`,
              position: 'top',
              visibilityTime: 5000,
              autoHide: true,
            });
            return;
          }
        }
        
        // Fallback: Use partial data from socket if API call fails
        const normalizedOrder = {
          ...orderData,
          id: orderId,
        };
        
        dispatch({type: 'ADD_NEW_ORDER', payload: normalizedOrder});
        console.log('⚠️ Using partial order data from socket:', normalizedOrder.orderNumber);
        
        // Show notification
        Toast.show({
          type: 'info',
          text1: 'New Order Assigned! 🎉',
          text2: `Order #${orderData.orderNumber} has been assigned to you`,
          position: 'top',
          visibilityTime: 5000,
          autoHide: true,
        });
      } catch (error) {
        console.error('Error fetching complete order details:', error);
        
        // Fallback: Use partial data from socket
        const normalizedOrder = {
          ...orderData,
          id: orderId,
        };
        
        dispatch({type: 'ADD_NEW_ORDER', payload: normalizedOrder});
        console.log('⚠️ Using partial order data from socket (fallback):', normalizedOrder.orderNumber);
        
        // Show notification
        Toast.show({
          type: 'info',
          text1: 'New Order Assigned! 🎉',
          text2: `Order #${orderData.orderNumber} has been assigned to you`,
          position: 'top',
          visibilityTime: 5000,
          autoHide: true,
        });
      }
    };

    // 🔔 EVENT: order:status-updated - When order status changes
    const handleOrderStatusUpdated = async (data) => {
      console.log('🔄 ORDER STATUS UPDATED:', data);
      const orderData = data.data;
      const orderId = orderData.orderId || orderData.id;
      
      try {
        // Fetch complete order details from API to ensure we have latest data
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          const result = await authService.getOrderById(token, orderId);
          if (result.success && result.order) {
            // Use complete order data from API
            const completeOrder = result.order;
            dispatch({type: 'UPDATE_ORDER_IN_LIST', payload: completeOrder});
            
            console.log('✅ Complete order updated in context:', completeOrder.orderNumber, completeOrder.status);
            
            // Show notification based on status
            const statusMessages = {
              'confirmed': 'Order has been confirmed',
              'assigned': 'Order has been assigned to agent',
              'out_for_delivery': 'Order is out for delivery',
              'delivered': 'Order delivered successfully! ✅',
              'cancelled': 'Order has been cancelled',
              'returned': 'Order has been returned',
            };
            
            const message = statusMessages[completeOrder.status] || `Order status: ${completeOrder.status}`;
            
            Toast.show({
              type: completeOrder.status === 'delivered' ? 'success' : 
                    completeOrder.status === 'cancelled' ? 'error' : 'info',
              text1: 'Order Status Update',
              text2: `Order #${completeOrder.orderNumber}: ${message}`,
              position: 'top',
              visibilityTime: 4000,
            });
            return;
          }
        }
        
        // Fallback: Use partial data from socket if API call fails
        const normalizedOrder = {
          ...orderData,
          id: orderId,
          status: orderData.status,
        };
        
        dispatch({type: 'UPDATE_ORDER_IN_LIST', payload: normalizedOrder});
        console.log('⚠️ Using partial order data from socket for update:', normalizedOrder.orderNumber, normalizedOrder.status);
        
        // Show notification based on status
        const statusMessages = {
          'confirmed': 'Order has been confirmed',
          'assigned': 'Order has been assigned to agent',
          'out_for_delivery': 'Order is out for delivery',
          'delivered': 'Order delivered successfully! ✅',
          'cancelled': 'Order has been cancelled',
          'returned': 'Order has been returned',
        };
        
        const message = statusMessages[orderData.status] || `Order status: ${orderData.status}`;
        
        Toast.show({
          type: orderData.status === 'delivered' ? 'success' : 
                orderData.status === 'cancelled' ? 'error' : 'info',
          text1: 'Order Status Update',
          text2: `Order #${orderData.orderNumber}: ${message}`,
          position: 'top',
          visibilityTime: 4000,
        });
      } catch (error) {
        console.error('Error fetching complete order details for update:', error);
        
        // Fallback: Use partial data from socket
        const normalizedOrder = {
          ...orderData,
          id: orderId,
          status: orderData.status,
        };
        
        dispatch({type: 'UPDATE_ORDER_IN_LIST', payload: normalizedOrder});
        console.log('⚠️ Using partial order data from socket for update (fallback):', normalizedOrder.orderNumber, normalizedOrder.status);
        
        // Show notification based on status
        const statusMessages = {
          'confirmed': 'Order has been confirmed',
          'assigned': 'Order has been assigned to agent',
          'out_for_delivery': 'Order is out for delivery',
          'delivered': 'Order delivered successfully! ✅',
          'cancelled': 'Order has been cancelled',
          'returned': 'Order has been returned',
        };
        
        const message = statusMessages[orderData.status] || `Order status: ${orderData.status}`;
        
        Toast.show({
          type: orderData.status === 'delivered' ? 'success' : 
                orderData.status === 'cancelled' ? 'error' : 'info',
          text1: 'Order Status Update',
          text2: `Order #${orderData.orderNumber}: ${message}`,
          position: 'top',
          visibilityTime: 4000,
        });
      }
    };

    // 🔔 EVENT: order:delivered - When order is successfully delivered
    const handleOrderDelivered = async (data) => {
      console.log('✅ ORDER DELIVERED:', data);
      const orderData = data.data;
      const orderId = orderData.orderId || orderData.id;
      
      try {
        // Fetch complete order details from API to ensure we have latest data
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          const result = await authService.getOrderById(token, orderId);
          if (result.success && result.order) {
            const completeOrder = result.order;
            
            // Remove from available orders and current order
            dispatch({type: 'REMOVE_ORDER_FROM_LIST', payload: orderId});
            
            if (state.currentOrder?.id === orderId) {
              dispatch({type: 'COMPLETE_ORDER', payload: completeOrder});
            }
            
            console.log('✅ Complete order delivered and removed from list:', completeOrder.orderNumber);
            
            // Show success notification
            Toast.show({
              type: 'success',
              text1: 'Delivery Completed! 🎉',
              text2: `Order #${completeOrder.orderNumber} has been delivered successfully`,
              position: 'top',
              visibilityTime: 5000,
            });
            return;
          }
        }
        
        // Fallback: Use partial data from socket if API call fails
        dispatch({type: 'REMOVE_ORDER_FROM_LIST', payload: orderId});
        
        if (state.currentOrder?.id === orderId) {
          dispatch({type: 'COMPLETE_ORDER', payload: { ...orderData, id: orderId }});
        }
        
        console.log('⚠️ Order delivered and removed from list (partial data):', orderData.orderNumber);
        
        // Show success notification
        Toast.show({
          type: 'success',
          text1: 'Delivery Completed! 🎉',
          text2: `Order #${orderData.orderNumber} has been delivered successfully`,
          position: 'top',
          visibilityTime: 5000,
        });
      } catch (error) {
        console.error('Error fetching complete order details for delivery:', error);
        
        // Fallback: Use partial data from socket
        dispatch({type: 'REMOVE_ORDER_FROM_LIST', payload: orderId});
        
        if (state.currentOrder?.id === orderId) {
          dispatch({type: 'COMPLETE_ORDER', payload: { ...orderData, id: orderId }});
        }
        
        console.log('⚠️ Order delivered and removed from list (fallback):', orderData.orderNumber);
        
        // Show success notification
        Toast.show({
          type: 'success',
          text1: 'Delivery Completed! 🎉',
          text2: `Order #${orderData.orderNumber} has been delivered successfully`,
          position: 'top',
          visibilityTime: 5000,
        });
      }
    };

    // 🔔 EVENT: order:created - New order created (if admin assigns in real-time)
    const handleOrderCreated = (data) => {
      console.log('🆕 NEW ORDER CREATED:', data);
      // Optionally refresh available orders
      // This will only be relevant if the order is pre-assigned to this agent
    };

    // Register event listeners
    socket.on('order:assigned', handleOrderAssigned);
    socket.on('order:status-updated', handleOrderStatusUpdated);
    socket.on('order:delivered', handleOrderDelivered);
    socket.on('order:created', handleOrderCreated);

    // Cleanup listeners on unmount
    return () => {
      console.log('🧹 Cleaning up Order Socket Listeners...');
      socket.off('order:assigned', handleOrderAssigned);
      socket.off('order:status-updated', handleOrderStatusUpdated);
      socket.off('order:delivered', handleOrderDelivered);
      socket.off('order:created', handleOrderCreated);
    };
  }, [socket, isConnected, state.currentOrder]);

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
        
        console.log(`📋 Fetched ${availableOrders.length} available orders from API`);
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