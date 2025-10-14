// App constants

export const ORDER_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  HEADING_TO_GAS_STATION: 'heading_to_gas_station',
  AT_GAS_STATION: 'at_gas_station',
  PICKED_UP: 'picked_up',
  HEADING_TO_CUSTOMER: 'heading_to_customer',
  DELIVERED: 'delivered',
  CANCELED: 'canceled',
};

export const USER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  BUSY: 'busy',
};

export const NOTIFICATION_TYPES = {
  NEW_ORDER: 'new_order',
  ORDER_UPDATE: 'order_update',
  PAYMENT: 'payment',
  SYSTEM: 'system',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

export const VEHICLE_TYPES = {
  BIKE: 'bike',
  CAR: 'car',
  VAN: 'van',
  TRUCK: 'truck',
};

export const GAS_TYPES = {
  LPG: 'LPG',
  CNG: 'CNG',
};

export const ACCESSORIES = {
  REGULATOR: 'Regulator',
  PIPE: 'Pipe',
  BURNER: 'Burner',
  STOVE: 'Stove',
  CONNECTOR: 'Connector',
};

export const DELIVERY_RADIUS = {
  NEAR: 5, // 5km
  MEDIUM: 10, // 10km
  FAR: 20, // 20km
};

export const EARNING_RATES = {
  BASE_RATE: 50, // Base delivery fee
  PER_KM_RATE: 5, // Per kilometer rate
  PER_CYLINDER_RATE: 20, // Per cylinder bonus
  PEAK_HOUR_BONUS: 1.5, // 50% bonus during peak hours
};

export const PEAK_HOURS = {
  MORNING: { start: 7, end: 9 },
  EVENING: { start: 17, end: 19 },
};

export const ORDER_PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

export const SUPPORT_CATEGORIES = [
  'Technical Issue',
  'Payment Problem',
  'Order Issue',
  'Account Problem',
  'Safety Concern',
  'Other',
];

export const FAQ_CATEGORIES = [
  'Getting Started',
  'Orders & Delivery',
  'Payments & Earnings',
  'Account & Profile',
  'Safety & Security',
  'Technical Support',
];

export const APP_PERMISSIONS = {
  LOCATION: 'location',
  CAMERA: 'camera',
  NOTIFICATIONS: 'notifications',
  STORAGE: 'storage',
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  LOCATION_ERROR: 'Unable to get your location. Please enable location services.',
  CAMERA_ERROR: 'Camera permission denied. Please enable camera access.',
  ORDER_NOT_FOUND: 'Order not found or has been canceled.',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  INVALID_OTP: 'Invalid OTP. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
};

export const SUCCESS_MESSAGES = {
  ORDER_ACCEPTED: 'Order accepted successfully!',
  ORDER_DELIVERED: 'Order delivered successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PAYMENT_SUCCESS: 'Payment completed successfully!',
  OTP_SENT: 'OTP sent successfully!',
  LOCATION_UPDATED: 'Location updated successfully!',
};

export const API_ENDPOINTS = {
  BASE_URL: 'https://64a18f64d85e.ngrok-free.app',
  SOCKET_URL: 'https://64a18f64d85e.ngrok-free.app',
  ORDERS: '/orders',
  PROFILE: '/profile',
  AUTH: '/auth',
  PAYMENTS: '/payments',
  NOTIFICATIONS: '/notifications',
  SUPPORT: '/support',
};

export const SUPPORT_EMAIL = 'support@example.com';
export const SUPPORT_PHONE = '+91-9999999999';

export const SUPPORT_CONTACT = {
  EMAIL: SUPPORT_EMAIL,
  PHONE: SUPPORT_PHONE,
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  SETTINGS: 'appSettings',
  CACHE: 'appCache',
  LOCATION: 'lastLocation',
};

export const MAP_CONFIG = {
  DEFAULT_ZOOM: 15,
  MAX_ZOOM: 20,
  MIN_ZOOM: 10,
  ANIMATION_DURATION: 1000,
  REGION_DELTA: 0.01,
};

export const VALIDATION_RULES = {
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 15,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  ADDRESS_MIN_LENGTH: 10,
  ADDRESS_MAX_LENGTH: 200,
  VEHICLE_NUMBER_MIN_LENGTH: 5,
  VEHICLE_NUMBER_MAX_LENGTH: 20,
  LICENSE_NUMBER_MIN_LENGTH: 5,
  LICENSE_NUMBER_MAX_LENGTH: 20,
};

export const ORDER_STATUS_FLOW = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.ACCEPTED,
  ORDER_STATUS.HEADING_TO_GAS_STATION,
  ORDER_STATUS.AT_GAS_STATION,
  ORDER_STATUS.PICKED_UP,
  ORDER_STATUS.HEADING_TO_CUSTOMER,
  ORDER_STATUS.DELIVERED,
];