const { withInfoPlist } = require('@expo/config-plugins');

/**
 * Expo Config Plugin to force Firebase App Check Debug Provider at native level
 * This bypasses the JS race condition by setting the provider in Info.plist
 */
const withAppCheckDebug = (config) => {
    return withInfoPlist(config, (config) => {
        // Force App Check to use Debug Provider in development
        // This is read by the native Firebase SDK before any JS code runs
        config.modResults.AppCheckDebugToken = '92D2418E-F4C8-420D-9DC7-6E15D4452028';

        return config;
    });
};

module.exports = withAppCheckDebug;
