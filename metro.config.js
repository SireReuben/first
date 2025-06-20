const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Only add proxy configuration for web development if web config exists
if (config.web) {
  config.web = {
    ...config.web,
    devServer: {
      ...config.web?.devServer,
      proxy: {
        '/api': {
          target: 'http://192.168.4.1',
          changeOrigin: true,
          pathRewrite: {
            '^/api': '', // Remove /api prefix when forwarding to Arduino
          },
          onError: (err, req, res) => {
            console.error('Proxy error:', err);
            res.writeHead(500, {
              'Content-Type': 'text/plain',
            });
            res.end('Arduino device not reachable. Please ensure you are connected to the AEROSPIN CONTROL WiFi network.');
          },
        },
      },
    },
  };
}

module.exports = config;