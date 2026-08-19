import { theme } from "@/constants/designTheme";
import { StyleSheet, View } from "react-native";
import { ProgressBar } from "./ProgressBar";
import { Text } from "./Text";

type FeedHeaderProps = {
  levelTitle: string;
  progress: number; // 0 to 1, toward the next tier
  xp: number;
  savedCount: number;
  avatarInitial: string;
};

export function FeedHeader({
  levelTitle,
  progress,
  xp,
  savedCount,
  avatarInitial,
}: FeedHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text variant="display" style={styles.title}>
          Feed
        </Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{avatarInitial}</Text>
        </View>
      </View>
      <Text variant="muted" style={styles.subLabel}>
        {levelTitle} · {Math.round(progress * 100)}% to next tier
      </Text>
      <ProgressBar progress={progress} />
      <View style={styles.statsRow}>
        <Stat dotColor={theme.colors.marigold} value={xp} label="XP" />
        <Stat dotColor={theme.colors.beadwork} value={savedCount} label="Saved" />
      </View>
    </View>
  );
}

function Stat({
  dotColor,
  value,
  label,
}: {
  dotColor: string;
  value: number;
  label: string;
}) {
  return (
    <View style={styles.stat}>
      <View style={[styles.statDot, { backgroundColor: dotColor }]} />
      <Text style={styles.statValue}>{value}</Text>
      <Text variant="muted" style={styles.statLabel}>
        {label}
      </Text>
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
    justifyContent: "space-between",
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: 22,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.indigo,
    alignItems: "center",
    justifyContent: "center",
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
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1.5,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statValue: {
    fontFamily: theme.fonts.displayBold,
    fontSize: 18,
  },
  statLabel: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
