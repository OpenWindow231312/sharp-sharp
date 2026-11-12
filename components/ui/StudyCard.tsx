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

const ACCENT = theme.colors.marigold;

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
            <Text style={styles.langTag}>{term.language.toUpperCase()}</Text>
            <View style={styles.termWrap}>
              <Text
                style={[
                  styles.termText,
                  styles.termTextHighlight,
                  { color: colorway.termShadowLight },
                ]}
              >
                {term.term}
              </Text>
              <Text
                style={[
                  styles.termText,
                  styles.termTextMain,
                  { textShadowColor: colorway.termShadowDark },
                ]}
              >
                {term.term}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.detailsSide}>
          <Text variant="muted" style={{ marginBottom: 4 }}>
            Meaning
          </Text>
          <Text style={{ marginBottom: 16 }}>{term.meaning}</Text>
          {examples.length > 0 ? (
            <View style={{ marginBottom: 16 }}>
              <Text variant="muted" style={{ marginBottom: 4 }}>
                {examples.length > 1 ? "Examples" : "Example"}
              </Text>
              {examples.map((example, index) => (
                <View
                  key={index}
                  style={index > 0 ? { marginTop: 8 } : undefined}
                >
                  <Text style={{ fontStyle: "italic" }}>
                    &quot;{example.sentence}&quot;
                  </Text>
                  {example.context ? (
                    <Text
                      variant="muted"
                      style={{ fontSize: 12, marginTop: 2 }}
                    >
                      {example.context}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}
          {term.region ? <Text variant="muted">{term.region}</Text> : null}
          <Text variant="muted" style={{ marginTop: 12 }}>
            Added by {term.submittedByName}
          </Text>
        </View>

        {/* Corner rivets frame the whole plaque, matching SwipeCard's hardware */}
        <View
          style={[
            styles.rivet,
            styles.rivetTL,
            {
              borderTopColor: colorway.rivetLight,
              borderLeftColor: colorway.rivetLight,
              borderBottomColor: colorway.rivetDark,
              borderRightColor: colorway.rivetDark,
            },
          ]}
        />
        <View
          style={[
            styles.rivet,
            styles.rivetTR,
            {
              borderTopColor: colorway.rivetLight,
              borderLeftColor: colorway.rivetLight,
              borderBottomColor: colorway.rivetDark,
              borderRightColor: colorway.rivetDark,
            },
          ]}
        />
        <View
          style={[
            styles.rivet,
            styles.rivetBL,
            {
              borderTopColor: colorway.rivetLight,
              borderLeftColor: colorway.rivetLight,
              borderBottomColor: colorway.rivetDark,
              borderRightColor: colorway.rivetDark,
            },
          ]}
        />
        <View
          style={[
            styles.rivet,
            styles.rivetBR,
            {
              borderTopColor: colorway.rivetLight,
              borderLeftColor: colorway.rivetLight,
              borderBottomColor: colorway.rivetDark,
              borderRightColor: colorway.rivetDark,
            },
          ]}
        />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: "row",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: ACCENT,
    backgroundColor: theme.colors.card,
    ...theme.shadow.card,
  },
  plaqueSide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  plaqueContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  langTag: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: ACCENT,
    marginBottom: 12,
  },
  termWrap: { alignItems: "center", justifyContent: "center" },
  termText: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 40,
    textAlign: "center",
  },
  termTextHighlight: {
    position: "absolute",
    transform: [{ translateX: -1 }, { translateY: -1 }],
  },
  termTextMain: {
    color: theme.colors.paper,
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 1,
  },
  detailsSide: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
    backgroundColor: theme.colors.card,
  },
  rivet: {
    position: "absolute",
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: ACCENT,
    borderWidth: 1,
  },
  rivetTL: { top: 10, left: 10 },
  rivetTR: { top: 10, right: 10 },
  rivetBL: { bottom: 10, left: 10 },
  rivetBR: { bottom: 10, right: 10 },
});
