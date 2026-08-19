import { theme } from "@/constants/designTheme";
import type { SlangTerm } from "@/types/slangTerm";
import { BookOpen, Quotes } from "phosphor-react-native";
import { forwardRef, useImperativeHandle } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Chip } from "./Chip";
import { PatternFill, type PatternVariant } from "./PatternFill";
import { Text } from "./Text";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;

const PATTERN_VARIANTS: PatternVariant[] = [
  "chevron",
  "diamond",
  "triangle",
  "beadscatter",
];

function patternForTerm(term: string): PatternVariant {
  let hash = 0;
  for (let i = 0; i < term.length; i++) {
    hash = (hash * 31 + term.charCodeAt(i)) >>> 0;
  }
  return PATTERN_VARIANTS[hash % PATTERN_VARIANTS.length];
}

type SwipeCardProps = {
  term: SlangTerm;
  onSwipe: (direction: "left" | "right") => void;
};

export type SwipeCardHandle = {
  flip: () => void;
};

export const SwipeCard = forwardRef<SwipeCardHandle, SwipeCardProps>(
  function SwipeCard({ term, onSwipe }, ref) {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const flip = useSharedValue(0);

    function toggleFlip() {
      flip.value = withTiming(flip.value === 0 ? 180 : 0, { duration: 450 });
    }

    useImperativeHandle(ref, () => ({
      flip: toggleFlip,
    }));

    const pan = Gesture.Pan()
      .onUpdate((e) => {
        translateX.value = e.translationX;
        translateY.value = e.translationY;
      })
      .onEnd((e) => {
        const passedThreshold = Math.abs(e.translationX) > SWIPE_THRESHOLD;
        if (passedThreshold) {
          const direction = e.translationX > 0 ? "right" : "left";
          translateX.value = withTiming(
            direction === "right" ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5,
            { duration: 220 },
            () => runOnJS(onSwipe)(direction),
          );
        } else {
          translateX.value = withSpring(0);
          translateY.value = withSpring(0);
        }
      });

    const tap = Gesture.Tap()
      .maxDuration(250)
      .onEnd(() => {
        runOnJS(toggleFlip)();
      });

    const composedGesture = Gesture.Race(pan, tap);

    const dragStyle = useAnimatedStyle(() => {
      const rotate = interpolate(
        translateX.value,
        [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
        [-12, 0, 12],
        Extrapolation.CLAMP,
      );
      return {
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
          { rotate: `${rotate}deg` },
        ],
      };
    });

    const frontFaceStyle = useAnimatedStyle(() => ({
      transform: [{ perspective: 1200 }, { rotateY: `${flip.value}deg` }],
    }));

    const backFaceStyle = useAnimatedStyle(() => ({
      transform: [{ perspective: 1200 }, { rotateY: `${flip.value - 180}deg` }],
    }));

    const saveStampStyle = useAnimatedStyle(() => ({
      opacity: interpolate(
        translateX.value,
        [10, SWIPE_THRESHOLD],
        [0, 1],
        Extrapolation.CLAMP,
      ),
    }));

    const skipStampStyle = useAnimatedStyle(() => ({
      opacity: interpolate(
        translateX.value,
        [-SWIPE_THRESHOLD, -10],
        [1, 0],
        Extrapolation.CLAMP,
      ),
    }));

    const patternVariant = patternForTerm(term.term);

    return (
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.wrapper, dragStyle]}>
          <Animated.View style={[styles.stamp, styles.saveStamp, saveStampStyle]}>
            <Text style={styles.stampText}>SAVE</Text>
          </Animated.View>
          <Animated.View style={[styles.stamp, styles.skipStamp, skipStampStyle]}>
            <Text style={styles.stampText}>SKIP</Text>
          </Animated.View>

          <Animated.View style={[styles.face, frontFaceStyle]}>
            <View style={styles.cardShell}>
              <PatternFill variant={patternVariant} style={styles.patternZone} />
              <View style={styles.termZone}>
                <Chip label={term.language} selected style={styles.langPill} />
                <Text style={styles.termText}>{term.term}</Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View
            style={[styles.face, styles.backFacePosition, backFaceStyle]}
          >
            <View style={[styles.cardShell, styles.backContent]}>
              <View style={styles.subheadingRow}>
                <BookOpen size={13} weight="bold" color={theme.colors.inkSoft} />
                <Text variant="muted" style={styles.subheadingText}>
                  Definition
                </Text>
              </View>
              <Text style={styles.meaningText}>{term.meaning}</Text>

              {term.examples && term.examples.length > 0 ? (
                <>
                  <View style={styles.subheadingRow}>
                    <Quotes size={13} weight="bold" color={theme.colors.inkSoft} />
                    <Text variant="muted" style={styles.subheadingText}>
                      In a sentence
                    </Text>
                  </View>
                  <Text style={styles.exampleText}>
                    "{term.examples[0].sentence}"
                  </Text>
                  {term.examples[0].context ? (
                    <Text variant="muted" style={styles.exampleContextText}>
                      {term.examples[0].context}
                    </Text>
                  ) : null}
                </>
              ) : null}

              {term.region ? (
                <Text variant="muted" style={styles.regionText}>
                  {term.region}
                </Text>
              ) : null}
              <Text variant="muted" style={styles.addedBy}>
                Added by {term.submittedByName}
              </Text>
            </View>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    );
  },
);

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    width: "100%",
    minHeight: 400,
  },
  face: {
    backfaceVisibility: "hidden",
    width: "100%",
  },
  backFacePosition: {
    position: "absolute",
    top: 0,
  },
  cardShell: {
    minHeight: 400,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    backgroundColor: theme.colors.card,
    ...theme.shadow.card,
  },
  patternZone: {
    height: 150,
  },
  termZone: {
    flex: 1,
    backgroundColor: theme.colors.indigo,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  langPill: {
    position: "absolute",
    top: theme.spacing.md,
    left: theme.spacing.md,
  },
  termText: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 34,
    color: "#FFFFFF",
    textAlign: "center",
  },
  backContent: {
    padding: theme.spacing.lg,
  },
  subheadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
    marginTop: theme.spacing.sm,
  },
  subheadingText: {
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  meaningText: {
    fontFamily: theme.fonts.body,
    fontSize: 17,
    lineHeight: 24,
    color: theme.colors.text,
  },
  exampleText: {
    fontFamily: theme.fonts.body,
    fontStyle: "italic",
    fontSize: 15,
    color: theme.colors.text,
  },
  exampleContextText: {
    fontSize: 13,
    fontStyle: "italic",
    marginTop: 2,
  },
  regionText: {
    marginTop: theme.spacing.sm,
  },
  addedBy: {
    marginTop: "auto",
    paddingTop: theme.spacing.md,
  },
  stamp: {
    position: "absolute",
    top: 20,
    borderWidth: 3,
    borderRadius: theme.radius.sm,
    paddingVertical: 4,
    paddingHorizontal: 12,
    zIndex: 10,
  },
  saveStamp: {
    right: 20,
    borderColor: theme.colors.highveld,
    transform: [{ rotate: "12deg" }],
  },
  skipStamp: {
    left: 20,
    borderColor: theme.colors.protea,
    transform: [{ rotate: "-12deg" }],
  },
  stampText: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 18,
    letterSpacing: 1,
  },
});
