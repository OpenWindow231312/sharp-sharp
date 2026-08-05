import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  type Auth,
} from "firebase/auth";
import {
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
export { auth, db };
export default app;
