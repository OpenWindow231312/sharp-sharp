import { theme } from "@/constants/designTheme";
import { safeBack } from "@/utils/navigation";
import { type Href } from "expo-router";
import { CaretLeft } from "phosphor-react-native";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "./Text";

type ScreenHeaderProps = {
  title: string;
  backTo?: Href;
  right?: ReactNode;
};

// Standard header for pushed screens: back caret, title, optional action.
export function ScreenHeader({
  title,
  backTo = "/(tabs)/profile",
  right,
}: ScreenHeaderProps) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => safeBack(backTo)}
        hitSlop={12}
        style={styles.back}
      >
        <CaretLeft size={22} weight="bold" color={theme.colors.ink} />
      </Pressable>
      <Text variant="heading" style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  back: {
    width: theme.tapTarget,
    height: theme.tapTarget,
    marginLeft: -theme.spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { flex: 1, textAlign: "center", fontSize: 22 },
  right: {
    width: theme.tapTarget,
    alignItems: "flex-end",
    justifyContent: "center",
  },
});
