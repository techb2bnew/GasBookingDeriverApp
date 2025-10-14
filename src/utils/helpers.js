// Helper functions for the app

export const formatCurrency = (amount) => {
  return `₹${parseFloat(amount).toFixed(2)}`;
};

export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
};

export const formatTime = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}min`;
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

export const getStatusColor = (status) => {
  const statusColors = {
    pending: '#717182',
    accepted: '#10b981',
    heading_to_gas_station: '#035db7',
    at_gas_station: '#f59e0b',
    picked_up: '#8b5cf6',
    heading_to_customer: '#035db7',
    delivered: '#10b981',
    canceled: '#ef4444',
  };
  return statusColors[status] || '#717182';
};

export const getStatusText = (status) => {
  const statusTexts = {
    pending: 'Pending',
    accepted: 'Accepted',
    heading_to_gas_station: 'Heading to Gas Station',
    at_gas_station: 'At Gas Station',
    picked_up: 'Gas Picked Up',
    heading_to_customer: 'Heading to Customer',
    delivered: 'Delivered',
    canceled: 'Canceled',
  };
  return statusTexts[status] || 'Unknown';
};

export const getStatusIcon = (status) => {
  const statusIcons = {
    pending: 'schedule',
    accepted: 'check-circle',
    heading_to_gas_station: 'local-gas-station',
    at_gas_station: 'local-gas-station',
    picked_up: 'shopping-bag',
    heading_to_customer: 'directions',
    delivered: 'check-circle',
    canceled: 'cancel',
  };
  return statusIcons[status] || 'info';
};

export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\s/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5, 10)}`;
  }
  return phone;
};

export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};