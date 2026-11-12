import { theme } from "@/constants/designTheme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  container: {
    paddingHorizontal: theme.spacing.lg,
  },
  gearButton: {
    width: theme.tapTarget,
    height: theme.tapTarget,
    alignItems: "center",
    justifyContent: "center",
    marginRight: -theme.spacing.sm,
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.sm,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.marigold,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginRight: theme.spacing.md,
  },
  avatarImage: { width: 52, height: 52, borderRadius: 26 },
  avatarInitial: {
    fontFamily: theme.fonts.displayBold,
    fontSize: 24,
    color: theme.colors.ink,
  },
  name: {
    fontFamily: theme.fonts.displayBold,
    fontSize: 22,
    color: theme.colors.paper,
  },
  levelCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadow.soft,
  },
  levelTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  levelLabel: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  levelTitle: {
    fontFamily: theme.fonts.displayBold,
    fontSize: 20,
    color: theme.colors.text,
  },
  levelBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -theme.spacing.md,
  },
  levelMeta: { fontFamily: theme.fonts.mono, fontSize: 11 },
});
