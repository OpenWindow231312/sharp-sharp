// Flip this to false once Firestore connectivity is sorted, to switch
// Feed and Learning Mode back to live data. Keeping this in one shared
// file means both screens flip together — no risk of forgetting one.
export const USE_MOCK_DATA = false;

// Flip this to true ONLY when you want to test against your local
// Firebase Emulator (firebase emulators:start running in another
// terminal). Leave this false for normal day-to-day use, and ALWAYS
// leave it false before your live demo / submission — otherwise the
// app tries to connect to a local emulator that isn't running, and
// Auth/Firestore will silently fail even though the code looks fine.
export const USE_LOCAL_EMULATOR = false;
