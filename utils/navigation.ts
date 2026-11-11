// utils/navigation.ts
import { router, type Href } from "expo-router";

export function safeBack(fallbackHref: Href) {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallbackHref);
  }
}
