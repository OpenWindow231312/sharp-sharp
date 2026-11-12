import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { useSharedValue, type SharedValue } from "react-native-reanimated";

// The floating tab bar sits on top of the tab screens so they can use the
// whole height. Screens that scroll report their scroll direction here and
// the bar slides away on the way down and back on the way up, like a
// normal mobile app.
type TabBarContextType = {
  hidden: SharedValue<number>; // 0 = showing, 1 = hidden
  show: () => void;
  hide: () => void;
};

const TabBarContext = createContext<TabBarContextType | null>(null);

// Space screens must leave at the bottom so the bar never covers content.
export const TAB_BAR_CLEARANCE = 112;

export function TabBarProvider({ children }: { children: ReactNode }) {
  const hidden = useSharedValue(0);
  const show = useCallback(() => {
    hidden.value = 0;
  }, [hidden]);
  const hide = useCallback(() => {
    hidden.value = 1;
  }, [hidden]);
  const value = useMemo(() => ({ hidden, show, hide }), [hidden, show, hide]);
  return (
    <TabBarContext.Provider value={value}>{children}</TabBarContext.Provider>
  );
}

export function useTabBar() {
  const ctx = useContext(TabBarContext);
  if (!ctx) throw new Error("useTabBar must be used inside TabBarProvider");
  return ctx;
}

// Returns an onScroll handler for a ScrollView. Hides the bar after a
// short downward drag, shows it on any upward drag, and always shows it
// near the top so a screen never opens with the bar missing.
export function useHideTabBarOnScroll() {
  const { hidden } = useTabBar();
  const lastY = useRef(0);
  const anchorY = useRef(0);

  return useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const maxY =
        e.nativeEvent.contentSize.height -
        e.nativeEvent.layoutMeasurement.height;
      const delta = y - lastY.current;
      lastY.current = y;

      if (y <= 8 || maxY <= TAB_BAR_CLEARANCE) {
        hidden.value = 0;
        anchorY.current = y;
        return;
      }
      if (delta < 0) {
        // Any upward movement brings it back straight away.
        hidden.value = 0;
        anchorY.current = y;
      } else if (y - anchorY.current > 24) {
        hidden.value = 1;
      }
    },
    [hidden],
  );
}
