import { theme } from "@/constants/designTheme";
import type { SlangTerm } from "@/types/slangTerm";
import { useMemo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { CardTexture, colorwayForTerm } from "./SwipeCard";
import { Text } from "./Text";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = 80;

type StudyCardProps = {
  term: SlangTerm;
  onSwipe: (direction: "left" | "right") => void;
};

export function StudyCard({ term, onSwipe }: StudyCardProps) {
  const translateX = useSharedValue(0);
  const colorway = useMemo(() => colorwayForTerm(term.id), [term.id]);
  // Skip examples with an empty sentence (some seeded data has them).
  const examples = (term.examples ?? []).filter((ex) => ex.sentence?.trim());

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > SWIPE_THRESHOLD) {
        const direction = e.translationX > 0 ? "right" : "left";
        translateX.value = withTiming(
          direction === "right" ? SCREEN_WIDTH : -SCREEN_WIDTH,
          { duration: 200 },
          () => runOnJS(onSwipe)(direction),
        );
      } else {
        translateX.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.row, cardStyle]}>
        <View
          style={[styles.plaqueSide, { backgroundColor: colorway.background }]}
        >
          <CardTexture variant={colorway.texture} />
          <View style={styles.plaqueContent}>
            <View style={styles.langPill}>
              <Text style={styles.langPillText}>
                {term.language.toUpperCase()}
              </Text>
            </View>
            <Text
              style={styles.termText}
              numberOfLines={3}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {term.term}
            </Text>
          </View>
        </View>

        <View style={styles.detailsSide}>
          <Text
            style={[
              styles.meaning,
              term.meaning.length > 110 && styles.meaningLong,
            ]}
          >
            {term.meaning}
          </Text>
          {examples.length > 0 ? (
            <View style={styles.examples}>
              {examples.slice(0, 2).map((example, index) => (
                <View
                  key={index}
                  style={index > 0 ? { marginTop: 10 } : undefined}
                >
                  <Text style={styles.example}>
                    &quot;{example.sentence}&quot;
                  </Text>
                  {example.context ? (
                    <Text style={styles.context}>{example.context}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}
          <Text style={styles.addedBy}>
            Added by {term.authorDisplayName ?? term.submittedByName}
          </Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  // Fills the whole landscape screen; the Learn screen overlays its
  // controls on top.
  row: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: theme.colors.card,
  },
  plaqueSide: {
    width: "42%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  plaqueContent: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  langPill: {
    backgroundColor: theme.colors.ink,
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 14,
  },
  langPillText: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    letterSpacing: 2,
    color: theme.colors.paper,
  },
  termText: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 48,
    lineHeight: 58,
    includeFontPadding: false,
    textAlign: "center",
    color: theme.colors.paper,
  },
  detailsSide: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 28,
    paddingLeft: 32,
    // Room for the overlaid next arrow and close button.
    paddingRight: 72,
    backgroundColor: theme.colors.card,
  },
  meaning: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 24,
    lineHeight: 31,
    color: theme.colors.text,
  },
  meaningLong: {
    fontSize: 19,
    lineHeight: 25,
  },
  examples: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: 14,
    paddingTop: 12,
  },
  example: {
    fontFamily: theme.fonts.body,
    fontStyle: "italic",
    fontSize: 17,
    lineHeight: 23,
    color: theme.colors.text,
  },
  context: {
    fontFamily: theme.fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  addedBy: {
    fontFamily: theme.fonts.body,
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 14,
  },
});
