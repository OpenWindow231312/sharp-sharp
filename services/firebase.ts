import { USE_LOCAL_EMULATOR } from "@/constants/devConfig";
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

// Route to local Firebase emulators ONLY when explicitly opted in via
// USE_LOCAL_EMULATOR — not just because we're in a dev build. This means
// a normal `npx expo start` always talks to the real cloud project
// (sharp-sharp-2f95c) unless you deliberately flip the flag on for
// local testing. Critical for demo day: no risk of the app silently
// trying to reach an emulator that isn't running.
if (__DEV__ && USE_LOCAL_EMULATOR) {
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
