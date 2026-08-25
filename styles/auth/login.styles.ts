import { theme } from "@/constants/designTheme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 100,
    backgroundColor: theme.colors.background,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
  },
});
