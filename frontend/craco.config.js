// Load configuration from environment or config file
const path = require('path');

// Environment variable overrides
const config = {
  disableHotReload: process.env.DISABLE_HOT_RELOAD === 'true',
};

module.exports = {
  // Strip react-refresh from Babel in production so builds don't break
  babel: {
    loaderOptions: (babelOptions, { env }) => {
      if (env === 'production' && Array.isArray(babelOptions.plugins)) {
        babelOptions.plugins = babelOptions.plugins.filter((plugin) => {
          // Plugin can be a string or [name, options] or a function
          if (Array.isArray(plugin)) {
            const [name] = plugin;
            return !(typeof name === 'string' && name.includes('react-refresh/babel'));
          }
          if (typeof plugin === 'string') {
            return !plugin.includes('react-refresh/babel');
          }
          // If it's some other shape, keep it
          return true;
        });
      }

      return babelOptions;
    },
  },

  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    configure: (webpackConfig, { env }) => {
      // Only strip ReactRefresh in production builds
      if (env === 'production' && webpackConfig && Array.isArray(webpackConfig.plugins)) {
        webpackConfig.plugins = webpackConfig.plugins.filter(
          (plugin) => plugin?.constructor?.name !== 'ReactRefreshPlugin'
        );
      }

      // Note: React 19 has known compatibility issues with react-scripts 5.0.1's Fast Refresh
      // If you encounter $RefreshSig$ errors, consider downgrading to React 18.x
      // The ReactRefreshPlugin should be automatically included by react-scripts in development

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
        // Ensure React Refresh runtime is available in development
        // Don't remove ReactRefreshPlugin in development - it's needed for Fast Refresh
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