import * as ScreenOrientation from "expo-screen-orientation";
import { Platform } from "react-native";

// Browsers reject screen.orientation.lock() outside fullscreen, which
// surfaced as an uncaught promise error on every screen when the app ran
// on web. Orientation locking is a phone feature, so skip it there and
// swallow the rare native failure instead of letting it bubble up.
async function lock(orientation: ScreenOrientation.OrientationLock) {
  if (Platform.OS === "web") return;
  try {
    await ScreenOrientation.lockAsync(orientation);
  } catch (error) {
    console.log("Orientation lock error:", error);
  }
}

export function lockPortrait() {
  return lock(ScreenOrientation.OrientationLock.PORTRAIT_UP);
}

export function lockLandscape() {
  return lock(ScreenOrientation.OrientationLock.LANDSCAPE);
}
