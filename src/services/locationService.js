// Mock location service
// In a real app, these would integrate with Google Maps API or similar services

export const locationService = {
  updateDriverLocation: async (latitude, longitude) => {
    // Simulate API call to update driver location on server
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log(`Driver location updated: ${latitude}, ${longitude}`);
    return {success: true};
  },
  
  getRoute: async (origin, destination) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock route calculation
    const distance = calculateDistance(origin, destination);
    const estimatedTime = Math.ceil(distance * 2); // 2 minutes per km
    
    // Generate mock route points (in real app, this would come from routing API)
    const route = generateMockRoute(origin, destination);
    
    return {
      route: route,
      distance: `${distance.toFixed(1)} km`,
      eta: `${estimatedTime} min`,
      duration: estimatedTime * 60, // in seconds
    };
  },
  
  geocodeAddress: async (address) => {
    // Simulate geocoding API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock geocoding (in real app, use Google Geocoding API)
    const mockCoordinates = {
      latitude: 37.7749 + (Math.random() - 0.5) * 0.01,
      longitude: -122.4194 + (Math.random() - 0.5) * 0.01,
    };
    
    return mockCoordinates;
  },
  
  reverseGeocode: async (latitude, longitude) => {
    // Simulate reverse geocoding API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock reverse geocoding
    return {
      address: '123 Mock Street, San Francisco, CA 94102',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
    };
  },
};

// Helper function to calculate distance between two coordinates
const calculateDistance = (origin, destination) => {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (destination.latitude - origin.latitude) * Math.PI / 180;
  const dLon = (destination.longitude - origin.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(origin.latitude * Math.PI / 180) * Math.cos(destination.latitude * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

// Helper function to generate mock route points
const generateMockRoute = (origin, destination) => {
  const points = [];
  const steps = 10; // Number of intermediate points
  
  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps;
    const lat = origin.latitude + (destination.latitude - origin.latitude) * ratio;
    const lng = origin.longitude + (destination.longitude - origin.longitude) * ratio;
    
    // Add some variation to make route look more realistic
    const variation = 0.0005;
    const varLat = lat + (Math.random() - 0.5) * variation;
    const varLng = lng + (Math.random() - 0.5) * variation;
    
    points.push({
      latitude: varLat,
      longitude: varLng,
    });
  }
  
  return points;
};