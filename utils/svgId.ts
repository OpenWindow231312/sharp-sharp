import { useId } from "react";

// React's useId() returns strings like ":r3:". A colon inside an SVG id
// referenced through url(#id) fails to resolve in react-native-svg, which
// silently drops the fill, so every pattern id goes through this instead.
export function useSvgId(prefix: string): string {
  const raw = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return `${prefix}-${raw}`;
}
