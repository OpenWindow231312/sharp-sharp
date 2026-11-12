import { theme } from "@/constants/designTheme";
import { useTabBar } from "@/context/TabBarContext";
import type { BottomTabBarProps } from "expo-router/tabs";
import * as Haptics from "expo-haptics";
import {
  Book,
  Bookmark,
  PlusCircle,
  User,
  type Icon,
} from "phosphor-react-native";
import { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "./Text";

const ICONS: Record<string, Icon> = {
  feed: Book,
  add: PlusCircle,
  saved: Bookmark,
  profile: User,
};

export function FloatingTabBar({
  state,
  descriptors,
  emitter,
  navigateToTab,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { hidden, show } = useTabBar();

  // Switching tabs always brings the bar back, so a tab never opens with
  // its own navigation missing.
  useEffect(() => {
    show();
  }, [state.index, show]);

  const slide = useAnimatedStyle(() => ({
    transform: [
      { translateY: withTiming(hidden.value * 140, { duration: 220 }) },
    ],
    opacity: withTiming(1 - hidden.value, { duration: 180 }),
  }));

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        { paddingBottom: insets.bottom || theme.spacing.md },
        slide,
      ]}
    >
      <Animated.View style={styles.shell}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const IconComponent = ICONS[route.name] ?? Book;
          const label =
            typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : (options.title ?? route.name);

          const onPress = () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const event = emitter.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigateToTab(route.key);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={[styles.tab, isFocused && styles.tabActive]}
            >
              <IconComponent
                size={24}
                weight={isFocused ? "fill" : "bold"}
                color={
                  isFocused ? theme.colors.primaryText : theme.colors.inkSoft
                }
              />
              {isFocused ? <Text style={styles.label}>{label}</Text> : null}
            </Pressable>
          );
        })}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Floats over the screens instead of taking a slice of the height, so
  // hiding it actually gives the space back.
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  shell: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: theme.radius.pill,
    padding: theme.spacing.sm,
    ...theme.shadow.soft,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.pill,
  },
  tabActive: {
    backgroundColor: theme.colors.indigoDeep,
  },
  label: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: 14,
    color: theme.colors.primaryText,
  },
});
