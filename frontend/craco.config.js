// Load configuration from environment or config file
const path = require('path');
const { getLoader, loaderByName } = require('@craco/craco');

// Environment variable overrides
const config = {
  disableHotReload: process.env.DISABLE_HOT_RELOAD === 'true',
};

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    configure: (webpackConfig) => {
      // In production builds, ensure React Fast Refresh is completely disabled.
      // Railway builds with NODE_ENV=production, and having react-refresh/babel
      // enabled there causes hard build/runtime errors.
      if (process.env.NODE_ENV === 'production') {
        const babelLoader = getLoader(webpackConfig, loaderByName('babel-loader'));

        if (babelLoader && babelLoader.match && babelLoader.match.options) {
          const opts = babelLoader.match.options;

          if (Array.isArray(opts.plugins)) {
            opts.plugins = opts.plugins.filter((plugin) => {
              // Plugin can be a string or [name, options]
              if (Array.isArray(plugin)) {
                const [name] = plugin;
                return !(typeof name === 'string' && name.includes('react-refresh/babel'));
              }
              if (typeof plugin === 'string') {
                return !plugin.includes('react-refresh/babel');
              }
              return true;
            });
          }
        }

        // Extra safety: strip any ReactRefresh webpack plugin that might leak into prod
        webpackConfig.plugins = webpackConfig.plugins.filter(
          (plugin) => plugin.constructor?.name !== 'ReactRefreshPlugin'
        );
      }

      // Disable hot reload completely if environment variable is set
      if (config.disableHotReload) {
        // Remove hot reload related plugins
        webpackConfig.plugins = webpackConfig.plugins.filter(plugin => {
          return !(plugin.constructor.name === 'HotModuleReplacementPlugin');
        });
        
        // Disable watch mode
        webpackConfig.watch = false;
        webpackConfig.watchOptions = {
          ignored: /.*/, // Ignore all files
        };
      } else {
        // Add ignored patterns to reduce watched directories
        webpackConfig.watchOptions = {
          ...webpackConfig.watchOptions,
          ignored: [
            '**/node_modules/**',
            '**/.git/**',
            '**/build/**',
            '**/dist/**',
            '**/coverage/**',
            '**/public/**',
          ],
        };
      }
      
      return webpackConfig;
    },
  },
};