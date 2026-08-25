import { theme } from "@/constants/designTheme";
import { BookmarkSimple, Flag, X } from "phosphor-react-native";
import { Pressable, StyleSheet, View } from "react-native";

type FeedControlsProps = {
  onSkip: () => void;
  onSave: () => void;
  onFlag: () => void;
};

export function FeedControls({ onSkip, onSave, onFlag }: FeedControlsProps) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onSkip}
        style={({ pressed }) => [
          styles.circle,
          styles.skipCircle,
          pressed && styles.pressed,
        ]}
      >
        <X size={20} weight="bold" color={theme.colors.protea} />
      </Pressable>
      <Pressable
        onPress={onSave}
        style={({ pressed }) => [
          styles.circle,
          styles.saveCircle,
          pressed && styles.pressed,
        ]}
      >
        <BookmarkSimple size={20} weight="bold" color={theme.colors.highveld} />
      </Pressable>
      <Pressable
        onPress={onFlag}
        style={({ pressed }) => [
          styles.circle,
          styles.flagCircle,
          pressed && styles.pressed,
        ]}
      >
        <Flag size={20} weight="bold" color={theme.colors.marigold} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  circle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.card,
  },
  skipCircle: {
    borderWidth: 2.5,
    borderColor: theme.colors.protea,
  },
  saveCircle: {
    borderWidth: 2.5,
    borderColor: theme.colors.highveld,
  },
  flagCircle: {
    borderWidth: 2.5,
    borderColor: theme.colors.marigold,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
});
