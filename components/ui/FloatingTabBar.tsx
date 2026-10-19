import { theme } from "@/constants/designTheme";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import * as Haptics from "expo-haptics";
import { Book, Bookmark, PlusCircle, User, type Icon } from "phosphor-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "./Text";

const ICONS: Record<string, Icon> = {
  feed: Book,
  add: PlusCircle,
  saved: Bookmark,
  profile: User,
};

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrap,
        { paddingBottom: insets.bottom || theme.spacing.md },
      ]}
    >
      <View style={styles.shell}>
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
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
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
                color={isFocused ? theme.colors.primaryText : theme.colors.inkSoft}
              />
              {isFocused ? <Text style={styles.label}>{label}</Text> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    backgroundColor: theme.colors.background,
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  shell: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.92)",
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
    backgroundColor: theme.colors.primary,
  },
  label: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: 14,
    color: theme.colors.primaryText,
  },
});
