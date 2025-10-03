# 📡 Socket Events Reference - Delivery Agent

Quick reference guide for all Socket.IO events relevant to **Delivery Agents** in the Driver App.

---

## 🎯 Events Delivery Agent RECEIVES (Listen)

### 1. `order:assigned`
**When:** Admin assigns an order to this delivery agent  
**API Trigger:** `PUT /api/orders/:id/assign-agent`  
**Payload:**
```javascript
{
  data: {
    orderId: "123",
    orderNumber: "ORD-2024-001",
    agentId: "agent-456",
    agentName: "John Driver",
    assignedAgentId: "agent-456",
    customerEmail: "customer@example.com",
    customerName: "Jane Customer",
    customerPhone: "+1234567890",
    customerAddress: "123 Main St",
    totalAmount: 500,
    status: "assigned",
    agencyId: "agency-789"
  }
}
```
**App Action:**
- Add order to available orders list
- Show notification: "New Order Assigned! 🎉"
- Play notification sound (optional)

**Code:**
```javascript
socket.on('order:assigned', (data) => {
  const order = data.data;
  dispatch({type: 'ADD_NEW_ORDER', payload: order});
  Toast.show({
    type: 'info',
    text1: 'New Order Assigned!',
    text2: `Order #${order.orderNumber}`
  });
});
```

---

### 2. `order:status-updated`
**When:** Order status changes (by agent or admin)  
**API Trigger:** `PUT /api/orders/:id/status`  
**Payload:**
```javascript
{
  data: {
    orderId: "123",
    orderNumber: "ORD-2024-001",
    status: "out_for_delivery", // or 'delivered', 'cancelled', 'returned'
    customerEmail: "customer@example.com",
    agencyId: "agency-789",
    assignedAgentId: "agent-456",
    otpSent: true, // if status is 'out_for_delivery'
    reason: "Customer cancelled" // if status is 'cancelled' or 'returned'
  }
}
```
**Possible Status Values:**
- `assigned` - Order assigned to agent
- `out_for_delivery` - Agent started delivery
- `delivered` - Order delivered successfully
- `cancelled` - Order cancelled
- `returned` - Order returned

**App Action:**
- Update order status in available/current order
- Show status notification
- Update UI to reflect new status

**Code:**
```javascript
socket.on('order:status-updated', (data) => {
  const order = data.data;
  dispatch({type: 'UPDATE_ORDER_IN_LIST', payload: order});
  
  const messages = {
    'out_for_delivery': 'Order is out for delivery',
    'delivered': 'Order delivered successfully! ✅',
    'cancelled': 'Order has been cancelled',
    'returned': 'Order has been returned'
  };
  
  Toast.show({
    type: order.status === 'delivered' ? 'success' : 
          order.status === 'cancelled' ? 'error' : 'info',
    text1: 'Order Status Update',
    text2: messages[order.status]
  });
});
```

---

### 3. `order:delivered`
**When:** Order delivery is completed with OTP verification  
**API Trigger:** `POST /api/orders/:id/verify-otp`  
**Payload:**
```javascript
{
  data: {
    orderId: "123",
    orderNumber: "ORD-2024-001",
    deliveryProof: "https://storage.com/proof.jpg",
    paymentReceived: true,
    deliveredAt: "2024-09-30T10:30:00Z",
    customerEmail: "customer@example.com",
    agencyId: "agency-789",
    assignedAgentId: "agent-456"
  }
}
```
**App Action:**
- Remove order from active orders
- Add to order history
- Show success notification
- Clear current order state
- Navigate to dashboard

**Code:**
```javascript
socket.on('order:delivered', (data) => {
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
    text2: `Order #${order.orderNumber} delivered successfully`
  });
});
```

---

### 4. `user:force-logout`
**When:** Agent account is blocked by admin  
**API Trigger:** `PUT /api/auth/users/:id/block`  
**Payload:**
```javascript
{
  data: {
    type: 'ACCOUNT_BLOCKED', // or 'AGENCY_DEACTIVATED'
    message: 'Your account has been blocked. Please contact support.',
    userId: "user-123",
    email: "agent@example.com",
    blockedBy: "admin-456",
    timestamp: "2024-09-30T10:30:00Z"
  }
}
```
**App Action:**
- Show alert dialog with message
- Clear AsyncStorage (auth token, user data)
- Logout user
- Disconnect socket
- Navigate to login screen

**Code:**
```javascript
socket.on('user:force-logout', (data) => {
  const { type, message } = data.data;
  
  Alert.alert(
    'Account Alert',
    message,
    [{
      text: 'OK',
      onPress: async () => {
        await logout(); // Clear storage and navigate to login
      }
    }],
    { cancelable: false }
  );
});
```

---

### 5. `agent:updated`
**When:** Agent profile or status is updated by admin  
**API Trigger:** `PUT /api/delivery-agents/:id`  
**Payload:**
```javascript
{
  data: {
    id: "agent-456",
    name: "John Driver",
    email: "john@example.com",
    phone: "+1234567890",
    agencyId: "agency-789",
    status: "active", // or 'inactive', 'blocked'
    updatedBy: "admin-123"
  }
}
```
**App Action:**
- Update agent profile in state
- If status is 'inactive' or 'blocked', force logout
- Show notification of profile update

**Code:**
```javascript
socket.on('agent:updated', (data) => {
  const agent = data.data;
  
  // If agent deactivated, force logout
  if (agent.status === 'inactive' || agent.status === 'blocked') {
    Alert.alert(
      'Account Status Changed',
      'Your agent account has been deactivated.',
      [{
        text: 'OK',
        onPress: async () => await logout()
      }],
      { cancelable: false }
    );
  } else {
    // Update profile
    updateUser({ deliveryAgent: agent });
  }
});
```

---

### 6. `system:message`
**When:** Admin sends system-wide announcement  
**API Trigger:** Custom admin panel action  
**Payload:**
```javascript
{
  type: 'SYSTEM_MESSAGE',
  message: 'System maintenance scheduled tonight 11 PM - 1 AM',
  messageType: 'warning', // 'info', 'warning', 'error', 'success'
  timestamp: "2024-09-30T10:30:00Z"
}
```
**App Action:**
- Show system notification
- Display as banner or toast based on severity

**Code:**
```javascript
socket.on('system:message', (data) => {
  const { message, messageType } = data;
  
  Toast.show({
    type: messageType === 'error' ? 'error' : 
          messageType === 'warning' ? 'error' : 
          messageType === 'success' ? 'success' : 'info',
    text1: 'System Notification',
    text2: message,
    visibilityTime: 6000
  });
});
```

---

### 7. `notification`
**When:** Generic notification event  
**API Trigger:** Various sources  
**Payload:**
```javascript
{
  type: 'USER_LOGGED_IN', // or other types
  data: {
    userId: "user-123",
    email: "agent@example.com",
    role: "agent",
    name: "John Driver",
    loginTime: "2024-09-30T10:30:00Z"
  },
  timestamp: "2024-09-30T10:30:00Z"
}
```
**App Action:**
- Handle based on notification type
- Log to console for debugging

**Code:**
```javascript
socket.on('notification', (data) => {
  const { type, data: notificationData } = data;
  
  console.log('Notification:', type, notificationData);
  
  // Handle specific types if needed
  if (type === 'USER_LOGGED_IN') {
    console.log('User logged in:', notificationData);
  }
});
```

---

## 📤 Events Delivery Agent EMITS (Send)

### 1. `subscribe-orders`
**When:** Socket connects and agent is authenticated  
**Payload:** None  
**Purpose:** Subscribe to order updates for this agent

**Code:**
```javascript
socket.emit('subscribe-orders');
```

---

### 2. `unsubscribe-orders`
**When:** Agent logs out or goes offline  
**Payload:** None  
**Purpose:** Unsubscribe from order updates

**Code:**
```javascript
socket.emit('unsubscribe-orders');
```

---

## 🔄 Complete Event Flow Examples

### Example 1: New Order Assignment

```
1. Admin assigns order to agent via API
   PUT /api/orders/123/assign-agent
   Body: { agentId: "agent-456" }

2. Backend emits socket event
   socket.io.to(agentId).emit('order:assigned', orderData)

3. Driver app receives event
   socket.on('order:assigned', (data) => { ... })

4. OrderContext adds order to state
   dispatch({type: 'ADD_NEW_ORDER', payload: order})

5. UI updates automatically
   - Order appears in available orders list
   - Badge count increases
   - Notification shows

6. Agent sees new order
   - Can view details
   - Can accept order
```

---

### Example 2: Order Status Update by Agent

```
1. Agent updates order status via API
   PUT /api/orders/123/status
   Body: { status: "out_for_delivery" }

2. Backend updates database and emits event
   socket.io.emit('order:status-updated', orderData)

3. Driver app receives event (confirmation)
   socket.on('order:status-updated', (data) => { ... })

4. OrderContext updates order
   dispatch({type: 'UPDATE_ORDER_IN_LIST', payload: order})

5. UI updates
   - Current order status badge changes
   - Timeline updates
   - Status notification shows

6. Agent sees updated status
   - Can proceed to next step
```

---

### Example 3: Order Delivery Completion

```
1. Agent completes delivery with OTP
   POST /api/orders/123/verify-otp
   Body: { otp: "123456", deliveryProof: file }

2. Backend verifies OTP and emits event
   socket.io.emit('order:delivered', orderData)

3. Driver app receives event
   socket.on('order:delivered', (data) => { ... })

4. OrderContext marks order complete
   dispatch({type: 'COMPLETE_ORDER', payload: order})

5. UI updates
   - Order removed from active list
   - Success message shows
   - Navigates to dashboard

6. Agent can see order in history
   - Order history screen shows delivered order
   - Earnings updated
```

---

### Example 4: Force Logout

```
1. Admin blocks agent account
   PUT /api/auth/users/123/block
   Body: { isBlocked: true }

2. Backend emits force logout event
   socket.io.to(userId).emit('user:force-logout', data)

3. Driver app receives event
   socket.on('user:force-logout', (data) => { ... })

4. useForceLogout hook handles it
   - Shows alert dialog
   - Calls logout function

5. AuthContext logs out user
   - Clears AsyncStorage
   - Disconnects socket
   - Resets all state

6. App navigates to login screen
   - User must contact support
```

---

## 🧪 Testing Checklist

Test each event to ensure proper functionality:

- [ ] **order:assigned** - Assign order via admin panel, check notification
- [ ] **order:status-updated** - Update status via API, verify UI update
- [ ] **order:delivered** - Complete delivery with OTP, check success flow
- [ ] **user:force-logout** - Block agent account, verify auto logout
- [ ] **agent:updated** - Update agent profile, check state update
- [ ] **system:message** - Send system message, verify notification
- [ ] **Connection** - Test reconnection on network interruption
- [ ] **Cleanup** - Verify listeners cleaned up on unmount

---

## 📊 Event Priority & Importance

| Event | Priority | Impact | Required |
|-------|----------|--------|----------|
| `order:assigned` | 🔴 HIGH | Critical for getting new orders | ✅ Yes |
| `order:status-updated` | 🟠 MEDIUM | Important for status sync | ✅ Yes |
| `order:delivered` | 🔴 HIGH | Critical for completion flow | ✅ Yes |
| `user:force-logout` | 🔴 HIGH | Security critical | ✅ Yes |
| `agent:updated` | 🟡 LOW | Nice to have for profile sync | ⚠️ Optional |
| `system:message` | 🟡 LOW | Nice to have for announcements | ⚠️ Optional |
| `notification` | 🟢 VERY LOW | Debug/logging purposes | ⚠️ Optional |

---

## 🎯 Quick Reference

| Need to... | Use Event | Direction |
|------------|-----------|-----------|
| Get new orders | `order:assigned` | 📥 Receive |
| Track status changes | `order:status-updated` | 📥 Receive |
| Complete delivery | `order:delivered` | 📥 Receive |
| Handle account block | `user:force-logout` | 📥 Receive |
| Subscribe to updates | `subscribe-orders` | 📤 Send |
| Unsubscribe | `unsubscribe-orders` | 📤 Send |

---

**Last Updated:** September 30, 2025  
**Version:** 1.0.0
