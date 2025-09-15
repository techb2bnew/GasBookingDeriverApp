// Mock order service for LPG Gas Delivery
// In a real app, these would be actual API calls to your backend

const mockOrders = [
  {
    id: 1001,
    status: 'available',
    createdAt: '2025-01-19T10:30:00Z',
    gasStation: {
      id: 1,
      name: 'HP Gas Station',
      address: '3B2 Mohali Bypass, Phase 3B-2, Sector 60, SAS Nagar, Punjab',
      location: { latitude: 30.7051, longitude: 76.7179 },
      distance: '0.5 km',
      phone: '+911123456789',
    },
    customer: {
      id: 1,
      name: 'Alice Johnson',
      address: 'Nearby, Mohali',
      location: { latitude: 30.7040, longitude: 76.7170 },
      distance: '1.2 km',
      phone: '+911198765432',
    },
    gasType: 'LPG',
    quantity: 2,
    accessories: ['Regulator', 'Pipe'],
    total: 1200.0,
    deliveryFee: 100.0,
    estimatedTime: '25 min',
  },
  {
    id: 1002,
    status: 'available',
    createdAt: '2025-01-19T11:15:00Z',
    gasStation: {
      id: 2,
      name: 'Indane Gas Center',
      address: 'Near Mohali Stadium, SAS Nagar, Punjab',
      location: { latitude: 30.7110, longitude: 76.7000 },
      distance: '1.0 km',
      phone: '+912212345678',
    },
    customer: {
      id: 2,
      name: 'Bob Wilson',
      address: 'Nearby, Mohali',
      location: { latitude: 30.7065, longitude: 76.7150 },
      distance: '2.0 km',
      phone: '+912298765432',
    },
    gasType: 'LPG',
    quantity: 1,
    accessories: ['Regulator'],
    total: 800.0,
    deliveryFee: 80.0,
    estimatedTime: '30 min',
  },
  {
    id: 1003,
    status: 'available',
    createdAt: '2025-01-19T12:00:00Z',
    gasStation: {
      id: 3,
      name: 'Bharat Gas Station',
      address: 'Sector 67, SAS Nagar, Punjab',
      location: { latitude: 30.7080, longitude: 76.7200 },
      distance: '0.8 km',
      phone: '+913312345678',
    },
    customer: {
      id: 3,
      name: 'Carol Davis',
      address: 'Phase 4, Mohali',
      location: { latitude: 30.7090, longitude: 76.7180 },
      distance: '1.5 km',
      phone: '+913398765432',
    },
    gasType: 'LPG',
    quantity: 3,
    accessories: ['Regulator', 'Pipe', 'Burner'],
    total: 1800.0,
    deliveryFee: 120.0,
    estimatedTime: '35 min',
  },
  {
    id: 1004,
    status: 'available',
    createdAt: '2025-01-19T13:30:00Z',
    gasStation: {
      id: 4,
      name: 'HP Gas Station',
      address: 'Sector 70, SAS Nagar, Punjab',
      location: { latitude: 30.7090, longitude: 76.7210 },
      distance: '1.2 km',
      phone: '+914412345678',
    },
    customer: {
      id: 4,
      name: 'David Brown',
      address: 'Phase 5, Mohali',
      location: { latitude: 30.7100, longitude: 76.7190 },
      distance: '2.5 km',
      phone: '+914498765432',
    },
    gasType: 'LPG',
    quantity: 1,
    accessories: ['Regulator', 'Pipe', 'Stove'],
    total: 1500.0,
    deliveryFee: 100.0,
    estimatedTime: '40 min',
  },
];

// Store completed orders in history
const orderHistory = [];

export const orderService = {
  getAvailableOrders: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockOrders.filter(order => order.status === 'available');
  },
  
  acceptOrder: async (orderId) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const order = mockOrders.find(o => o.id === orderId);
    if (order) {
      order.status = 'accepted';
      return order;
    }
    throw new Error('Order not found');
  },
  
  updateOrderStatus: async (orderId, status, data = {}) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const order = mockOrders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      if (data.location) {
        order.driverLocation = data.location;
      }
      return order;
    }
    throw new Error('Order not found');
  },
  
  completeOrder: async (orderId, deliveryData) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const order = mockOrders.find(o => o.id === orderId);
    if (order) {
      const completedOrder = {
        ...order,
        status: 'delivered',
        completedAt: new Date().toISOString(),
        deliveryProof: deliveryData.photo,
        deliveryOtp: deliveryData.otp,
        deliveryNotes: deliveryData.notes,
      };
      
      // Add to order history (don't delete, just store)
      orderHistory.unshift(completedOrder);
      
      // Remove from active orders
      const index = mockOrders.findIndex(o => o.id === orderId);
      if (index > -1) {
        mockOrders.splice(index, 1);
      }
      
      return completedOrder;
    }
    throw new Error('Order not found');
  },
  
  getOrderHistory: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return orderHistory; // Return actual order history
  },
  
  getCurrentOrder: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockOrders.find(order => 
      ['accepted', 'heading_to_gas_station', 'at_gas_station', 'picked_up', 'heading_to_customer'].includes(order.status)
    ) || null;
  },
};