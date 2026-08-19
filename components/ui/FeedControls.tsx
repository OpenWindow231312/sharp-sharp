import { theme } from "@/constants/designTheme";
import { ArrowCounterClockwise, BookmarkSimple, X } from "phosphor-react-native";
import { Pressable, StyleSheet, View } from "react-native";

type FeedControlsProps = {
  onSkip: () => void;
  onFlip: () => void;
  onSave: () => void;
};

export function FeedControls({ onSkip, onFlip, onSave }: FeedControlsProps) {
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
        onPress={onFlip}
        style={({ pressed }) => [
          styles.circle,
          styles.flipCircle,
          pressed && styles.pressed,
        ]}
      >
        <ArrowCounterClockwise size={22} weight="bold" color={theme.colors.ink} />
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
  flipCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.marigold,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
});
