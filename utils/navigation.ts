// utils/navigation.ts
import { router } from "expo-router";

export function safeBack(fallbackHref: string) {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallbackHref);
  }
}
