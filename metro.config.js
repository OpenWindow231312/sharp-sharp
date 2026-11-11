const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Works around a known Expo + Firebase bundling issue where Metro's
// package-exports resolution picks the wrong build of the Firebase SDK
// (Node-oriented instead of React-Native-oriented), which can cause
// Firestore to fail to connect even with correct config and a working
// network connection.
//
// Package exports stay ON for everything else: since React Native 0.88
// (Expo SDK 58), files such as `react-native/setup-env` can only be
// resolved through package exports, so turning them off globally breaks
// the bundle.
const isFirebase = (moduleName) =>
  moduleName === 'firebase' ||
  moduleName.startsWith('firebase/') ||
  moduleName.startsWith('@firebase/');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (isFirebase(moduleName)) {
    return context.resolveRequest(
      { ...context, unstable_enablePackageExports: false },
      moduleName,
      platform,
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
