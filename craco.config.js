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
    configure: (webpackConfig) => {
      // Extra safety: strip any ReactRefresh webpack plugin that might leak into prod
      if (webpackConfig && Array.isArray(webpackConfig.plugins)) {
        webpackConfig.plugins = webpackConfig.plugins.filter(
          (plugin) => plugin?.constructor?.name !== 'ReactRefreshPlugin'
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