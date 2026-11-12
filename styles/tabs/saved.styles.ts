import { BAND_OVERLAP } from "@/components/ui/ScreenBand";
import { theme } from "@/constants/designTheme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  body: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: -BAND_OVERLAP,
  },
  spine: {
    width: 10,
    height: 44,
    borderRadius: 5,
    marginRight: theme.spacing.md,
  },
  emptyCard: { alignItems: "center", padding: 32 },
  termCard: { marginBottom: 12 },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  termText: {
    fontFamily: theme.fonts.displayBold,
    fontSize: 19,
    color: theme.colors.text,
    marginBottom: 2,
  },
  removeButton: { padding: 4 },
  studyCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.card,
    marginBottom: 12,
    ...theme.shadow.soft,
  },
  studyTitle: {
    fontFamily: theme.fonts.displayBold,
    fontSize: 18,
    color: theme.colors.text,
  },
  studyHintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  studyHint: { fontSize: 12, flexShrink: 1 },
  listHint: { fontSize: 12, marginBottom: 12 },
});
