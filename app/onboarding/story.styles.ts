import { theme } from "@/constants/designTheme";
import { StyleSheet } from "react-native";

const MINI_PATTERN_HEIGHT = 28;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    paddingTop: 60,
    backgroundColor: theme.colors.background,
  },
  skipButton: {
    position: "absolute",
    top: 56,
    right: theme.spacing.md,
    minWidth: theme.tapTarget,
    minHeight: theme.tapTarget,
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 10,
  },
  skipText: {
    fontFamily: theme.fonts.bodySemibold,
    fontSize: 14,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  dialogueWrap: {
    gap: theme.spacing.sm,
  },
  bubbleRow: {
    flexDirection: "row",
  },
  bubble: {
    maxWidth: "84%",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
  bubbleReceived: {
    backgroundColor: theme.colors.surface,
  },
  bubbleReply: {
    backgroundColor: theme.colors.indigo,
  },
  bubbleTailLeft: {
    borderBottomLeftRadius: theme.radius.sm / 2,
  },
  bubbleTailRight: {
    borderBottomRightRadius: theme.radius.sm / 2,
  },
  bubbleTextReceived: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 17,
    lineHeight: 24,
    color: theme.colors.text,
  },
  bubbleTextReply: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 17,
    lineHeight: 24,
    color: "#FFFFFF",
  },
  heroWrap: {},
  heroBigLine: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 92,
    // lineHeight must comfortably exceed fontSize for a display weight this
    // large — anything close to or under fontSize gets the top of the
    // glyphs clipped by the Text node's own line box on native.
    lineHeight: 106,
    color: theme.colors.marigold,
  },
  heroSmallLine: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 32,
    lineHeight: 38,
    color: theme.colors.indigo,
    marginTop: theme.spacing.sm,
  },
  heroBody: {
    fontFamily: theme.fonts.body,
    fontSize: 17,
    lineHeight: 25,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  mechanicsWrap: {
    flex: 1,
    justifyContent: "center",
  },
  mechanicsHeading: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 30,
    lineHeight: 36,
    color: theme.colors.text,
  },
  mechanicsText: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 18,
    lineHeight: 26,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xl,
  },
  closingWrap: {
    flex: 1,
    alignItems: "center",
    paddingBottom: theme.spacing.xl,
  },
  closingContentGroup: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xl,
  },
  closingHeadline: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 32,
    lineHeight: 38,
    color: theme.colors.indigo,
    textAlign: "center",
  },
  closingHeadlineAccent: {
    color: theme.colors.marigold,
  },
  closingCaption: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 16,
    lineHeight: 22,
    color: theme.colors.textMuted,
    textAlign: "center",
    paddingHorizontal: theme.spacing.md,
  },
  closingButtonWrap: {
    alignSelf: "stretch",
    marginTop: theme.spacing.sm,
  },
  miniCardWrap: {
    alignSelf: "center",
    marginVertical: theme.spacing.xs,
  },
  miniCard: {
    width: 170,
    borderRadius: theme.radius.md,
    overflow: "hidden",
    backgroundColor: theme.colors.card,
    ...theme.shadow.soft,
  },
  miniCardPattern: {
    height: MINI_PATTERN_HEIGHT,
  },
  miniCardTermZone: {
    height: 78,
    backgroundColor: theme.colors.indigo,
    alignItems: "center",
    justifyContent: "center",
  },
  miniCardTerm: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 20,
    color: "#FFFFFF",
  },
  miniFlagIconWrap: {
    position: "absolute",
    top: MINI_PATTERN_HEIGHT + theme.spacing.xs,
    right: theme.spacing.xs,
  },
  miniArrowWrap: {
    position: "absolute",
    top: -8,
    right: -28,
  },
});
