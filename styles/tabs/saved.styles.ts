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
    marginBottom: 10,
  },
  termText: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 22,
    color: theme.colors.text,
    marginBottom: 4,
  },
});
