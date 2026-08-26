import { theme } from "@/constants/designTheme";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

type AnimatedIntroProps = {
  onFinish: () => void;
};

// Timeline:
// 0ms    - wordmark ("Sharp" / "Sharp") is visible immediately, no
//          entrance animation of its own — Stage 1 (native splash)
//          already shows this same paper background with no logo, so
//          the wordmark should read as "already in place", not as
//          something arriving.
// 400ms  - tagline starts a fade + slight upward slide in (400ms).
// 1400ms - 600ms after the tagline finishes, the background morphs
//          from paper to indigo (300ms) — the same indigo the auth
//          screens use — while the indigo "Sharp" line morphs to
//          white in step, so it stays legible once the background
//          catches up to its own color. Marigold "Sharp" is untouched,
//          it already reads fine against both.
// 1700ms - morph completes, colors now match the next screen exactly,
//          so onFinish fires immediately with no separate fade step.
const TAGLINE_DELAY = 400;
const TAGLINE_DURATION = 400;
const HOLD_MS = 600;
const MORPH_DURATION = 300;
const MORPH_START = TAGLINE_DELAY + TAGLINE_DURATION + HOLD_MS;

export function AnimatedIntro({ onFinish }: AnimatedIntroProps) {
  const taglineProgress = useSharedValue(0);
  const colorProgress = useSharedValue(0);

  useEffect(() => {
    taglineProgress.value = withDelay(
      TAGLINE_DELAY,
      withTiming(1, { duration: TAGLINE_DURATION }),
    );
    colorProgress.value = withDelay(
      MORPH_START,
      withTiming(1, { duration: MORPH_DURATION }, (finished) => {
        if (finished) runOnJS(onFinish)();
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineProgress.value,
    transform: [
      { translateY: interpolate(taglineProgress.value, [0, 1], [8, 0]) },
    ],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      colorProgress.value,
      [0, 1],
      [theme.colors.paper, theme.colors.indigo],
    ),
  }));

  const wordmarkIndigoStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      colorProgress.value,
      [0, 1],
      [theme.colors.indigo, theme.colors.primaryText],
    ),
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={styles.wordmark}>
        <Animated.Text style={[styles.wordmarkLine, wordmarkIndigoStyle]}>
          Sharp
        </Animated.Text>
        <Animated.Text style={[styles.wordmarkLine, styles.wordmarkMarigold]}>
          Sharp
        </Animated.Text>
      </View>
      <Animated.Text style={[styles.tagline, taglineStyle]}>
        Real Slang, Real SA
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  wordmark: {
    alignItems: "center",
  },
  wordmarkLine: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 48,
    lineHeight: 54,
    textAlign: "center",
  },
  wordmarkMarigold: {
    color: theme.colors.marigold,
  },
  tagline: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 15,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md,
  },
});
