import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  connectAuthEmulator,
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  type Auth,
} from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore,
  type Firestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// TEMPORARY diagnostic — remove once we've confirmed the config is loading.
// Doesn't print the actual key value, just whether each field made it
// through from .env or came back undefined.
console.log("Firebase config check:", {
  apiKey: firebaseConfig.apiKey ? "present" : "MISSING",
  projectId: firebaseConfig.projectId ?? "MISSING",
  authDomain: firebaseConfig.authDomain ?? "MISSING",
});

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

let db: Firestore;
try {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    useFetchStreams: false,
  });
} catch {
  db = getFirestore(app);
}

// Route to local Firebase emulators during development, so we're testing
// against real Auth/Firestore behaviour without touching the cloud project.
// __DEV__ is false in production builds, so this block simply never runs
// once the app is actually shipped.
if (__DEV__) {
  // Expo Go serves the app from a specific host (e.g. 192.168.1.23:8081) —
  // reusing that same host for the emulators means this works automatically
  // whether we're on the iOS Simulator (host is "localhost"), Android
  // Emulator, or a physical phone on the same WiFi — no manual IP editing.
  const debuggerHost = Constants.expoConfig?.hostUri;
  const EMULATOR_HOST = debuggerHost ? debuggerHost.split(":")[0] : "127.0.0.1";

  connectAuthEmulator(auth, `http://${EMULATOR_HOST}:9099`, {
    disableWarnings: true,
  });
  connectFirestoreEmulator(db, EMULATOR_HOST, 8080);
  console.log(`Connected to local Firebase emulators at ${EMULATOR_HOST}`);
}

export { auth, db };
export default app;
