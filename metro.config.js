const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  server: {
    port: 8081,
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        // Add timeout headers
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Keep-Alive', 'timeout=300, max=1000');
        return middleware(req, res, next);
      };
    },
  },
  resolver: {
    // Add any custom resolver options here
  },
  transformer: {
    // Add any custom transformer options here
  },
  watchFolders: [],
  maxWorkers: 4, // Limit workers to prevent memory issues
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
