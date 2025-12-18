import { API_ENDPOINTS } from '../utils/constants';

export const authService = {
  requestOtp: async (email) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: 'agent' }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = data?.error || 'Failed to send OTP';
        return { success: false, error: message, statusCode: data?.statusCode || response.status };
      }

      return { success: true, message: data?.message || 'OTP sent successfully' };
    } catch (error) {
      return { success: false, error: error.message || 'Network error' };
    }
  },

  verifyOtp: async (email, otp,fcmToken, Platform) => {
    console.log("fcmToken, Platform>>",fcmToken, Platform);
    
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api${API_ENDPOINTS.AUTH}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, role: 'agent',fcmToken:fcmToken, fcmDeviceType:Platform }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = data?.error || 'Verification failed';
        return { success: false, error: message, statusCode: data?.statusCode || response.status };
      }

      // Backend shape:
      // { success, message, data: { user, token, deliveryAgent } }
      const token = data?.data?.token ?? data?.token;
      const user = data?.data?.user ?? data?.user;
      const deliveryAgent = data?.data?.deliveryAgent;
      return { success: true, token, user, deliveryAgent };
    } catch (error) {
      return { success: false, error: error.message || 'Network error' };
    }
  },

  logout: async (token) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = data?.error || 'Failed to logout';
        return { success: false, error: message, statusCode: data?.statusCode || response.status };
      }

      return { success: true, message: data?.message || 'Logged out successfully' };
    } catch (error) {
      return { success: false, error: error.message || 'Network error' };
    }
  },

  validateToken: async (token) => {
    // TODO: implement with backend if available
    if (token) {
      return { success: true };
    }
    throw new Error('Invalid token');
  },

  getProfile: async (token) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = data?.error || 'Failed to fetch profile';
        return { success: false, error: message, statusCode: data?.statusCode || response.status };
      }

      // { success, data: { user, deliveryAgent } }
      return { success: true, user: data?.data?.user, deliveryAgent: data?.data?.deliveryAgent };
    } catch (error) {
      return { success: false, error: error.message || 'Network error' };
    }
  },

  updateComprehensiveProfile: async (token, profileData) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/auth/agent/profile/comprehensive`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = data?.error || 'Failed to update profile';
        return { success: false, error: message, statusCode: data?.statusCode || response.status };
      }

      return { success: true, message: data?.message || 'Profile updated successfully', data: data?.data };
    } catch (error) {
      return { success: false, error: error.message || 'Network error' };
    }
  },

  updateProfileWithImage: async (token, profileData, imageAsset) => {
    try {
      const formData = new FormData();
      
      // Add profile data
      Object.keys(profileData).forEach(key => {
        formData.append(key, profileData[key]);
      });

      // Add image with key 'image'
      if (imageAsset) {
        formData.append('image', {
          uri: imageAsset.uri,
          type: imageAsset.type || 'image/jpeg',
          name: imageAsset.fileName || 'profile.jpg',
        });
      }

      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/auth/agent/profile/comprehensive`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = data?.error || 'Failed to update profile';
        return { success: false, error: message, statusCode: data?.statusCode || response.status };
      }

      return { success: true, message: data?.message || 'Profile updated successfully', data: data?.data };
    } catch (error) {
      return { success: false, error: error.message || 'Network error' };
    }
  },

  updateAgentStatus: async (token, status) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/auth/agent/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = data?.error || 'Failed to update status';
        return { success: false, error: message, statusCode: data?.statusCode || response.status };
      }

      return { success: true, message: data?.message || 'Status updated successfully', data: data?.data };
    } catch (error) {
      return { success: false, error: error.message || 'Network error' };
    }
  },

  getOrders: async (token) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/orders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = data?.error || 'Failed to fetch orders';
        return { success: false, error: message, statusCode: data?.statusCode || response.status };
      }

      return { 
        success: true, 
        message: data?.message || 'Orders retrieved successfully', 
        orders: data?.data?.orders || [],
        pagination: data?.data?.pagination || null
      };
    } catch (error) {
      return { success: false, error: error.message || 'Network error' };
    }
  },

  getActiveOrders: async (token) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/orders?status=out_for_delivery`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = data?.error || 'Failed to fetch active orders';
        return { success: false, error: message, statusCode: data?.statusCode || response.status };
      }

      return { 
        success: true, 
        message: data?.message || 'Active orders retrieved successfully', 
        orders: data?.data?.orders || [],
        pagination: data?.data?.pagination || null
      };
    } catch (error) {
      return { success: false, error: error.message || 'Network error' };
    }
  },

  getOrderById: async (token, orderId) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = data?.error || 'Failed to fetch order details';
        return { success: false, error: message, statusCode: data?.statusCode || response.status };
      }

      return { 
        success: true, 
        message: data?.message || 'Order details retrieved successfully', 
        order: data?.data?.order || null
      };
    } catch (error) {
      return { success: false, error: error.message || 'Network error' };
    }
  },

  acceptOrder: async (token, orderId, status = 'out_for_delivery', agentNotes = 'Order accepted by driver') => {
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status, 
          agentNotes 
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = data?.error || 'Failed to accept order';
        return { success: false, error: message, statusCode: data?.statusCode || response.status };
      }

      return { 
        success: true, 
        message: data?.message || 'Order accepted successfully', 
        order: data?.data?.order || data?.order
      };
    } catch (error) {
      return { success: false, error: error.message || 'Network error' };
    }
  },

  updateOrderStatus: async (token, orderId, status, agentNotes = '') => {
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status, 
          agentNotes 
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = data?.error || 'Failed to update order status';
        return { success: false, error: message, statusCode: data?.statusCode || response.status };
      }

      return { 
        success: true, 
        message: data?.message || 'Order status updated successfully', 
        order: data?.data?.order || data?.order
      };
    } catch (error) {
      return { success: false, error: error.message || 'Network error' };
    }
  },

  sendDeliveryOtp: async (token, orderId) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/orders/${orderId}/send-otp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = data?.error || 'Failed to send OTP';
        return { success: false, error: message, statusCode: data?.statusCode || response.status };
      }

      return { 
        success: true, 
        message: data?.message || 'OTP sent successfully'
      };
    } catch (error) {
      return { success: false, error: error.message || 'Network error' };
    }
  },

  verifyDeliveryOtp: async (token, orderId, otp) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/orders/${orderId}/verify-otp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = data?.error || 'Failed to verify OTP';
        return { success: false, error: message, statusCode: data?.statusCode || response.status };
      }

      return { 
        success: true, 
        message: data?.message || 'OTP verified successfully',
        order: data?.data?.order || data?.order
      };
    } catch (error) {
      return { success: false, error: error.message || 'Network error' };
    }
  },

  verifyDeliveryOtpWithProof: async (token, orderId, otp, deliveryNote, paymentReceived, deliveryProofImage) => {
    try {
      const formData = new FormData();
      
      // Add OTP
      formData.append('otp', otp);
      
      // Add delivery note
      formData.append('deliveryNote', deliveryNote || '');
      
      // Add payment received status
      formData.append('paymentReceived', paymentReceived.toString());
      
      // Add delivery proof image if provided
      if (deliveryProofImage) {
        formData.append('deliveryProof', {
          uri: deliveryProofImage.uri,
          type: deliveryProofImage.type || 'image/jpeg',
          name: deliveryProofImage.fileName || 'delivery_proof.jpg',
        });
      }

      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/orders/${orderId}/verify-otp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = data?.error || 'Failed to verify OTP';
        return { success: false, error: message, statusCode: data?.statusCode || response.status };
      }

      return { 
        success: true, 
        message: data?.message || 'OTP verified successfully',
        order: data?.data?.order || data?.order
      };
    } catch (error) {
      return { success: false, error: error.message || 'Network error' };
    }
  },

  getAgentStats: async (token) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/orders/agent/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = data?.error || 'Failed to fetch agent stats';
        return { success: false, error: message, statusCode: data?.statusCode || response.status };
      }

      return { 
        success: true, 
        message: data?.message || 'Agent stats retrieved successfully',
        data: data?.data || {},
        orders: data?.data?.orders || [],
        stats: data?.data?.stats || {}
      };
    } catch (error) {
      return { success: false, error: error.message || 'Network error' };
    }
  },
};