import { theme } from "@/constants/designTheme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 70,
    backgroundColor: theme.colors.background,
  },
  emptyCard: { alignItems: "center", padding: 32 },
  termCard: { marginBottom: 12 },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  termText: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 22,
    color: theme.colors.text,
  },
  termLanguage: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  removeButton: { padding: 4 },
  studyCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.paperAlt,
    marginBottom: 12,
  },
  studyTitle: {
    fontFamily: theme.fonts.displayBold,
    fontSize: 17,
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
