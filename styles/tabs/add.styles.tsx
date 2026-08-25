import { theme } from "@/constants/designTheme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 70,
    backgroundColor: theme.colors.background,
    flexGrow: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    width: theme.tapTarget,
    height: theme.tapTarget,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -12,
  },
  skipText: {
    fontSize: 13,
    textDecorationLine: "underline",
  },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  examplesList: { gap: 10 },
  exampleRow: { flexDirection: "row", alignItems: "flex-start" },
  exampleCard: {},
  exampleSentence: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: 15,
    color: theme.colors.text,
    marginBottom: 4,
  },
  exampleContext: { fontSize: 13, fontStyle: "italic" },
  removeExampleButton: { padding: 4 },
  previewCard: { minHeight: 160 },
  previewStrip: {
    height: 12,
    marginTop: -theme.spacing.md,
    marginHorizontal: -theme.spacing.md,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
  },
  previewBody: { flex: 1, justifyContent: "center" },
  previewTerm: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 32,
    color: theme.colors.text,
  },
  celebrationContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: theme.colors.background,
  },
  checkmark: { fontSize: 64, color: theme.colors.highveld, fontWeight: "800" },
  xpEarned: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 28,
    color: theme.colors.highveld,
    marginBottom: 8,
  },
});
