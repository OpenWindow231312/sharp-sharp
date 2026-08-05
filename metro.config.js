const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Works around a known Expo + Firebase bundling issue where Metro's
// package-exports resolution picks the wrong build of the Firebase SDK
// (Node-oriented instead of React-Native-oriented), which can cause
// Firestore to fail to connect even with correct config and a working
// network connection.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
