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
//          already shows this same indigo background with no logo, so
//          the wordmark should read as "already in place", not as
//          something arriving.
// 400ms  - tagline starts a fade + slight upward slide in (400ms).
// 1400ms - 600ms after the tagline finishes, the whole view starts a
//          plain opacity fade to 0 (350ms). The background stays the
//          same indigo throughout — it already matches the login/signup
//          screens underneath, so no color-matching animation is needed.
// 1750ms - fade completes, revealing the matching indigo screen
//          underneath, so onFinish fires immediately.
const TAGLINE_DELAY = 400;
const TAGLINE_DURATION = 400;
const HOLD_MS = 600;
const FADE_DURATION = 350;
const FADE_START = TAGLINE_DELAY + TAGLINE_DURATION + HOLD_MS;

export function AnimatedIntro({ onFinish }: AnimatedIntroProps) {
  const taglineProgress = useSharedValue(0);
  const fadeProgress = useSharedValue(1);

  useEffect(() => {
    taglineProgress.value = withDelay(
      TAGLINE_DELAY,
      withTiming(1, { duration: TAGLINE_DURATION }),
    );
    fadeProgress.value = withDelay(
      FADE_START,
      withTiming(0, { duration: FADE_DURATION }, (finished) => {
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

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fadeProgress.value,
  }));

  return (
    <Animated.View style={[styles.container, fadeStyle]}>
      <View style={styles.wordmark}>
        <Text style={[styles.wordmarkLine, styles.wordmarkWhite]}>Sharp</Text>
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
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.indigo,
  },
  wordmark: {
    alignItems: "center",
  },
  wordmarkLine: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 48,
    lineHeight: 56,
    textAlign: "center",
  },
  wordmarkWhite: {
    color: theme.colors.primaryText,
  },
  wordmarkMarigold: {
    color: theme.colors.marigold,
  },
  tagline: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 15,
    color: theme.colors.primaryText,
    opacity: 0.85,
    marginTop: theme.spacing.md,
  },
});
