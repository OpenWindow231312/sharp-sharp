import { theme } from "@/constants/designTheme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 70,
    backgroundColor: theme.colors.background,
  },
  stack: {
    flex: 1,
    justifyContent: "center",
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
