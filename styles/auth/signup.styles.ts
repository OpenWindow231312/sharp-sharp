import { theme } from "@/constants/designTheme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.highveld,
  },
  header: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
  },
  wordmark: {
    flexDirection: "row",
    marginTop: theme.spacing.xxl,
  },
  wordmarkLine: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 48,
    lineHeight: 55,
  },
  wordmarkWhite: {
    color: theme.colors.primaryText,
  },
  wordmarkMarigold: {
    color: theme.colors.marigold,
    marginLeft: theme.spacing.sm,
  },
  tagline: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 15,
    color: theme.colors.primaryText,
    opacity: 0.85,
    marginTop: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
    paddingBottom: 60,
  },
  cardHeading: {
    marginTop: theme.spacing.l,
    marginBottom: theme.spacing.sm,
  },
});
