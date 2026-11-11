import { theme } from "@/constants/designTheme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 70,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg,
  },
  title: { fontSize: 35 },
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
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginRight: theme.spacing.md,
  },
  avatarImage: { width: 72, height: 72, borderRadius: 36 },
  avatarInitial: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 30,
    color: theme.colors.primaryText,
  },
  name: {
    fontFamily: theme.fonts.displayBold,
    fontSize: 22,
    color: theme.colors.text,
  },
  subline: { fontSize: 13, marginTop: 2 },
  levelCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
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
