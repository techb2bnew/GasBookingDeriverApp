# 🚀 Socket.IO Integration Documentation - Driver App

This document provides a complete guide to the Socket.IO real-time integration implemented in the Gas Booking Driver App.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Architecture](#architecture)
4. [Socket Events for Delivery Agents](#socket-events-for-delivery-agents)
5. [Implementation Details](#implementation-details)
6. [Testing Socket Events](#testing-socket-events)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The Driver App uses **Socket.IO** for real-time communication with the backend server. This enables:

- ✅ **Real-time order assignments** - Get notified instantly when new orders are assigned
- ✅ **Live order status updates** - Track order status changes in real-time
- ✅ **Force logout handling** - Automatically logout if account is blocked/deactivated
- ✅ **System notifications** - Receive important system messages
- ✅ **Automatic reconnection** - Maintains connection even on network interruptions

---

## 📦 Installation

Socket.IO client is already installed. If you need to reinstall:

```bash
npm install socket.io-client
# or
yarn add socket.io-client
```

---

## 🏗️ Architecture

### File Structure

```
src/
├── utils/
│   └── socket.js                 # Socket service singleton
├── context/
│   ├── SocketContext.js          # Socket React Context Provider
│   ├── AuthContext.js            # Authentication context
│   └── OrderContext.js           # Order context with socket listeners
├── hooks/
│   └── useForceLogout.js         # Hook for handling force logout events
└── screens/
    └── DashboardScreen.js        # Using socket integration
```

### Component Hierarchy

```
App
└── AuthProvider
    └── SocketProvider (connected after authentication)
        └── LocationProvider
            └── OrderProvider (listens to order socket events)
                └── AppNavigator
```

---

## 🔔 Socket Events for Delivery Agents

### Events the Driver App **LISTENS TO** (Receives from Server)

| Event Name | When Triggered | Data Structure | Action Taken |
|------------|----------------|----------------|--------------|
| `order:assigned` | Admin assigns order to this agent | `{ data: { id, orderNumber, customerName, ... } }` | Add order to available list, show notification |
| `order:status-updated` | Order status changes | `{ data: { orderId, orderNumber, status, ... } }` | Update order in list/current order, show notification |
| `order:delivered` | Order is delivered | `{ data: { orderId, orderNumber, deliveryProof, ... } }` | Remove from active orders, show success notification |
| `user:force-logout` | Agent account blocked | `{ data: { type, message } }` | Show alert, logout user |
| `agent:updated` | Agent profile/status updated | `{ data: { id, name, status, ... } }` | Check if deactivated, force logout if needed |
| `system:message` | System announcement | `{ type, message, messageType }` | Show system notification |
| `notification` | Generic notification | `{ type, data }` | Handle custom notifications |

### Events the Driver App **EMITS** (Sends to Server)

| Event Name | When Triggered | Data Sent | Purpose |
|------------|----------------|-----------|---------|
| `subscribe-orders` | On socket connection | None | Subscribe to order updates for this agent |
| `unsubscribe-orders` | On logout/disconnect | None | Unsubscribe from order updates |

---

## 🛠️ Implementation Details

### 1. **Socket Service** (`src/utils/socket.js`)

Singleton service that manages the Socket.IO connection.

```javascript
import socketService from '../utils/socket';

// Connect with auth token
socketService.connect(token);

// Subscribe to orders
socketService.subscribeToOrders();

// Listen to event
socketService.on('order:assigned', (data) => {
  console.log('New order assigned:', data);
});

// Emit event
socketService.emit('custom-event', { data: 'value' });

// Disconnect
socketService.disconnect();
```

**Key Features:**
- Automatic reconnection (up to 5 attempts)
- Connection state management
- Event listener management
- WebSocket + Polling fallback

---

### 2. **Socket Context** (`src/context/SocketContext.js`)

Provides socket instance to all components via React Context.

```javascript
import { useSocket } from '../context/SocketContext';

function MyComponent() {
  const { socket, isConnected, socketService } = useSocket();

  useEffect(() => {
    if (socket && isConnected) {
      socket.on('custom-event', handleEvent);
      return () => socket.off('custom-event', handleEvent);
    }
  }, [socket, isConnected]);
}
```

**Features:**
- Initializes socket on user authentication
- Automatically subscribes to order updates
- Handles system messages and notifications
- Cleans up on logout

---

### 3. **Order Context Integration** (`src/context/OrderContext.js`)

Listens to real-time order events and updates state accordingly.

**Socket Event Handlers:**

#### `order:assigned` Handler
```javascript
const handleOrderAssigned = (data) => {
  const order = data.data;
  
  // Add to available orders
  dispatch({type: 'ADD_NEW_ORDER', payload: order});
  
  // Show notification
  Toast.show({
    type: 'info',
    text1: 'New Order Assigned! 🎉',
    text2: `Order #${order.orderNumber}`,
  });
};
```

#### `order:status-updated` Handler
```javascript
const handleOrderStatusUpdated = (data) => {
  const order = data.data;
  
  // Update order in list
  dispatch({type: 'UPDATE_ORDER_IN_LIST', payload: order});
  
  // Show appropriate notification
  Toast.show({
    type: order.status === 'delivered' ? 'success' : 'info',
    text1: 'Order Status Update',
    text2: `Order #${order.orderNumber}: ${order.status}`,
  });
};
```

#### `order:delivered` Handler
```javascript
const handleOrderDelivered = (data) => {
  const order = data.data;
  
  // Remove from active orders
  dispatch({type: 'REMOVE_ORDER_FROM_LIST', payload: order.orderId});
  
  // Mark as complete
  if (currentOrder?.id === order.orderId) {
    dispatch({type: 'COMPLETE_ORDER', payload: order});
  }
  
  Toast.show({
    type: 'success',
    text1: 'Delivery Completed! 🎉',
  });
};
```

---

### 4. **Force Logout Hook** (`src/hooks/useForceLogout.js`)

Handles forced logout scenarios (account blocked/deactivated).

```javascript
import { useForceLogout } from '../hooks/useForceLogout';

function DashboardScreen() {
  // Automatically handles force logout events
  useForceLogout();
  
  // Rest of component...
}
```

**What it does:**
1. Listens to `user:force-logout` and `agent:updated` events
2. Shows alert dialog to user
3. Automatically logs out user
4. Clears all local storage
5. Redirects to login screen

---

## 🧪 Testing Socket Events

### Test with Backend API Calls

When you call these API endpoints, corresponding socket events are emitted:

#### 1. Test Order Assignment
```javascript
// API Call
PUT /api/orders/:id/assign-agent
Body: { agentId: "your-agent-id" }

// Expected Socket Event
socket.on('order:assigned', (data) => {
  console.log('Order assigned:', data.data);
  // Should see notification in app
});
```

#### 2. Test Order Status Update
```javascript
// API Call
PUT /api/orders/:id/status
Body: { status: "out_for_delivery" }

// Expected Socket Event
socket.on('order:status-updated', (data) => {
  console.log('Status updated:', data.data.status);
  // Should see notification in app
});
```

#### 3. Test Order Delivery
```javascript
// API Call
POST /api/orders/:id/verify-otp
Body: { otp: "123456", deliveryProof: file }

// Expected Socket Event
socket.on('order:delivered', (data) => {
  console.log('Order delivered:', data.data);
  // Should see success notification
});
```

#### 4. Test Force Logout
```javascript
// API Call
PUT /api/auth/users/:id/block
Body: { isBlocked: true }

// Expected Socket Event
socket.on('user:force-logout', (data) => {
  console.log('Force logout:', data.data.message);
  // Should see alert and auto logout
});
```

---

## 🔍 Monitoring Socket Events

### Check Console Logs

The app logs all socket events with emojis for easy identification:

```
🔌 Connecting to Socket.IO server...
✅ Socket Connected - ID: abc123
📦 Subscribing to order updates
🎧 Setting up Order Socket Listeners...

📦 ORDER ASSIGNED: { data: { ... } }
🔄 ORDER STATUS UPDATED: { data: { ... } }
✅ ORDER DELIVERED: { data: { ... } }
🚫 Force Logout Event: { data: { ... } }

🧹 Cleaning up Order Socket Listeners...
🔌 Disconnecting socket...
```

---

## 🐛 Troubleshooting

### Socket Not Connecting

**Problem:** Socket fails to connect or keeps disconnecting.

**Solutions:**
1. Check backend server is running
2. Verify `SOCKET_URL` in `constants.js` is correct
3. Check auth token is valid
4. Check network connectivity
5. Look for CORS issues in backend logs

```javascript
// Debug connection
socket.on('connect_error', (error) => {
  console.error('Connection Error:', error);
});
```

---

### Events Not Received

**Problem:** Socket events are not being received in the app.

**Solutions:**
1. Check if socket is connected: `socket.connected === true`
2. Verify subscription: `socketService.subscribeToOrders()` was called
3. Check event name matches exactly (case-sensitive)
4. Verify backend is emitting events correctly
5. Check if you're listening to the correct room/channel

```javascript
// Debug events
socket.onAny((eventName, ...args) => {
  console.log('Received event:', eventName, args);
});
```

---

### Force Logout Not Working

**Problem:** User doesn't get logged out when blocked.

**Solutions:**
1. Verify `useForceLogout()` hook is called in component
2. Check socket connection is active
3. Verify backend emits `user:force-logout` event
4. Check logout function in AuthContext works

---

### Duplicate Notifications

**Problem:** Notifications appear multiple times for same event.

**Solutions:**
1. Ensure event listeners are cleaned up properly
2. Check useEffect dependencies
3. Verify socket listeners are not registered multiple times

```javascript
useEffect(() => {
  socket.on('event', handler);
  
  // IMPORTANT: Clean up listener
  return () => socket.off('event', handler);
}, [socket]);
```

---

## 📊 Real-time Update Flow

### Order Assignment Flow

```
Backend: Admin assigns order to agent
    ↓
Backend emits: socket.io.to(agentId).emit('order:assigned', orderData)
    ↓
Driver App receives: order:assigned event
    ↓
OrderContext handles event
    ↓
Adds order to availableOrders state
    ↓
UI updates automatically (React re-render)
    ↓
Toast notification shows to user
```

### Order Status Update Flow

```
Driver App: Agent updates order status via API
    ↓
Backend updates database
    ↓
Backend emits: socket.io.emit('order:status-updated', orderData)
    ↓
Driver App receives: order:status-updated event
    ↓
OrderContext updates order in state
    ↓
UI reflects new status
    ↓
Toast notification shows
```

---

## 🔐 Security Considerations

1. **Authentication**: Socket connection requires valid JWT token
2. **Authorization**: Backend filters events by user role (agent only sees their orders)
3. **Token Refresh**: If token expires, reconnection with new token needed
4. **Secure Transport**: Uses WebSocket Secure (WSS) in production

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] Update `SOCKET_URL` in `constants.js` to production URL
- [ ] Test socket connection on real devices
- [ ] Verify all event handlers work correctly
- [ ] Test reconnection on network interruptions
- [ ] Verify force logout works
- [ ] Test on both iOS and Android
- [ ] Check battery impact of persistent socket connection
- [ ] Enable socket event logging in production (optional)

---

## 📞 Support

For issues related to Socket.IO integration:

1. Check console logs for error messages
2. Verify backend socket implementation
3. Test with Socket.IO client debugging tool
4. Review this documentation

---

## 🎉 Summary

The Driver App now has **complete real-time functionality** using Socket.IO:

✅ Real-time order assignments  
✅ Live order status updates  
✅ Instant delivery notifications  
✅ Force logout handling  
✅ System notifications  
✅ Automatic reconnection  

All socket events are properly mapped to backend API endpoints and integrated into the app's state management system.

---

**Last Updated:** September 30, 2025  
**Version:** 1.0.0  
**Author:** AI Assistant
