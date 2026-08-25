import { theme } from "@/constants/designTheme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 70,
    backgroundColor: theme.colors.background,
  },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 26,
    color: theme.colors.primaryText,
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.pill,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    alignItems: "center",
  },
  tabButtonActive: { backgroundColor: theme.colors.primary },
  levelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  statsRow: { flexDirection: "row" },
  statCard: { flex: 1, alignItems: "center", paddingVertical: 20 },
  statNumber: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 28,
    color: theme.colors.text,
  },
  emptyCard: { alignItems: "center", padding: 32 },
  levelListRow: { flexDirection: "row", alignItems: "center" },
  levelListTitle: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 12,
  },
  levelUnlockText: { marginTop: 10, fontSize: 13 },
  termCard: { marginBottom: 12 },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  deleteIconButton: { padding: 4 },
  termText: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 20,
    color: theme.colors.text,
    marginBottom: 4,
  },
});
