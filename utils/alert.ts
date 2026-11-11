import { Alert, Platform, type AlertButton } from "react-native";

// react-native-web ships Alert as a no-op, so every confirmation and error
// dialog in the app silently vanished on web. This wrapper keeps the native
// Alert.alert signature and falls back to the browser's own dialogs there,
// so the same call site works on iOS, Android and web.
export function showAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[],
) {
  if (Platform.OS !== "web") {
    Alert.alert(title, message, buttons);
    return;
  }

  const text = message ? `${title}\n\n${message}` : title;
  const actionable = (buttons ?? []).filter((b) => b.style !== "cancel");
  const cancel = (buttons ?? []).find((b) => b.style === "cancel");

  if (actionable.length === 0) {
    if (typeof window !== "undefined") window.alert(text);
    buttons?.[0]?.onPress?.();
    return;
  }

  const confirmed =
    typeof window !== "undefined" ? window.confirm(text) : false;
  if (confirmed) {
    actionable[actionable.length - 1].onPress?.();
  } else {
    cancel?.onPress?.();
  }
}
