import { theme } from "@/constants/designTheme";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolate,
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
// 1400ms - 600ms after the tagline finishes, the whole screen starts
//          fading out (300ms).
// 1700ms - fade-out completes, onFinish fires.
const TAGLINE_DELAY = 400;
const TAGLINE_DURATION = 400;
const HOLD_MS = 600;
const FADE_OUT_DURATION = 300;
const FADE_OUT_START = TAGLINE_DELAY + TAGLINE_DURATION + HOLD_MS;

export function AnimatedIntro({ onFinish }: AnimatedIntroProps) {
  const taglineProgress = useSharedValue(0);
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    taglineProgress.value = withDelay(
      TAGLINE_DELAY,
      withTiming(1, { duration: TAGLINE_DURATION }),
    );
    screenOpacity.value = withDelay(
      FADE_OUT_START,
      withTiming(0, { duration: FADE_OUT_DURATION }, (finished) => {
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

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, screenStyle]}>
      <View style={styles.wordmark}>
        <Text style={[styles.wordmarkLine, styles.wordmarkIndigo]}>
          Sharp
        </Text>
        <Text style={[styles.wordmarkLine, styles.wordmarkMarigold]}>
          Sharp
        </Text>
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
    backgroundColor: theme.colors.paper,
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
  wordmarkIndigo: {
    color: theme.colors.indigo,
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
