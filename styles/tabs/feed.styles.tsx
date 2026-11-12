import { theme } from "@/constants/designTheme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    // The tab bar floats over the screen now, so leave room under the
    // swipe controls.
    paddingBottom: 96,
    backgroundColor: theme.colors.background,
  },
  // Just tall enough for the card, so the swipe controls sit right under
  // it instead of being pushed to the bottom of a tall phone.
  stack: {
    height: 440,
    justifyContent: "flex-start",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.marigold,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginLeft: theme.spacing.md,
  },
  avatarImage: { width: 48, height: 48, borderRadius: 24 },
  avatarText: {
    fontFamily: theme.fonts.displayBold,
    fontSize: 22,
    color: theme.colors.ink,
  },
  xpRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  xpTrack: {
    flex: 1,
    height: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(255,248,236,0.2)",
    overflow: "hidden",
  },
  xpFill: {
    height: "100%",
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.marigold,
  },
  quizButton: {
    alignSelf: "center",
    marginBottom: theme.spacing.sm,
  },
  peekWrapper: {
    position: "absolute",
    left: theme.spacing.lg,
    right: theme.spacing.lg,
  },
  peekWrapperNear: {
    top: 8,
    transform: [{ scale: 0.96 }],
    opacity: 0.6,
  },
  peekWrapperFar: {
    top: 16,
    transform: [{ scale: 0.92 }],
    opacity: 0.32,
  },
  peekCard: { minHeight: 340 },
  emptyCard: { alignItems: "center", padding: 32 },
});
