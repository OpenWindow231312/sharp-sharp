import { theme } from "@/constants/designTheme";
import { Image, StyleSheet, View } from "react-native";
import { ProgressBar } from "./ProgressBar";
import { Text } from "./Text";

type FeedHeaderProps = {
  levelTitle: string;
  progress: number; // 0 to 1, toward the next tier
  xp: number;
  avatarInitial: string;
  photoBase64?: string;
};

export function FeedHeader({
  levelTitle,
  progress,
  xp,
  avatarInitial,
  photoBase64,
}: FeedHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.avatar}>
          {photoBase64 ? (
            <Image source={{ uri: photoBase64 }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{avatarInitial}</Text>
          )}
        </View>
      </View>
      <Text variant="muted" style={styles.subLabel}>
        {levelTitle} · {xp} XP · {Math.round(progress * 100)}% to next tier
      </Text>
      <ProgressBar progress={progress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: theme.spacing.xs,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.indigo,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  avatarText: {
    fontFamily: theme.fonts.displayBold,
    color: "#FFFFFF",
    fontSize: 14,
  },
  subLabel: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    marginBottom: theme.spacing.sm,
  },
});
