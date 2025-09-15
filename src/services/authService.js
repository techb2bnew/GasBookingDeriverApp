export const authService = {
  sendOtp: async (phoneNumber) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, you would send OTP via SMS service
    console.log(`OTP sent to ${phoneNumber}`);
    
    return {
      success: true,
      message: 'OTP sent successfully',
    };
  },

  loginWithOtp: async (phoneNumber, otp) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Accept any phone number and any 4-digit OTP
    if (phoneNumber && phoneNumber.length >= 10 && otp && otp.length === 4) {
      return {
        success: true,
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: Date.now(),
          name: 'Driver User',
          phone: phoneNumber,
        },
      };
    } else {
      throw new Error('Invalid phone number or OTP');
    }
  },
  
  logout: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return {success: true};
  },
  
  validateToken: async (token) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (token && token.startsWith('mock-jwt-token-')) {
      return {
        success: true,
        user: {
          id: Date.now(),
          name: 'Driver User',
          phone: '9876543210',
        },
      };
    }
    
    throw new Error('Invalid token');
  },
};