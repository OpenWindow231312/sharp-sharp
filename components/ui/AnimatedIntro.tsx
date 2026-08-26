import { theme } from "@/constants/designTheme";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import Svg, { Defs, Line, Pattern, Rect } from "react-native-svg";

type AnimatedIntroProps = {
  onFinish: () => void;
};

// Same hairline texture used for the Indigo colorway in
// components/ui/SwipeCard.tsx's per-term card system, and already reused
// as-is in app/auth/login.tsx (LoginTexture) since this splash and the
// login screen share the same indigo colorway.
//
// Uses a fixed id rather than React's useId() — useId() returns strings
// containing colons (e.g. ":r3:"), and a colon in an SVG id referenced via
// url(#id) fails to resolve in react-native-svg, silently dropping the
// pattern fill entirely. Only one SplashTexture ever renders at a time, so
// a static id is safe.
function SplashTexture() {
  const id = "splash-hairline";
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <Pattern
          id={id}
          patternUnits="userSpaceOnUse"
          width={4}
          height={4}
          patternTransform="rotate(115)"
        >
          <Line
            x1={0}
            y1={0}
            x2={0}
            y2={4}
            stroke="white"
            strokeOpacity={0.035}
            strokeWidth={1}
          />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

// Timeline:
// 0ms    - wordmark line 1 (marigold "Sharp") starts a fly-in: translateY
//          +20 -> 0 and opacity 0 -> 1, over 300ms.
// 120ms  - wordmark line 2 (white "Sharp") starts the same fly-in,
//          staggered 120ms behind line 1 — Stage 1 (native splash)
//          already shows this same indigo background with no logo, so
//          the wordmark reads as arriving rather than "already in place".
// 400ms  - tagline starts a fade + slight upward slide in (400ms).
// 1850ms - 1050ms after the tagline finishes, the wordmark/tagline group
//          (not the indigo background) starts a plain opacity fade to 0
//          (350ms). The indigo background itself never animates — it
//          stays solid throughout and matches the contentStyle now set
//          on the index/login screens in app/_layout.tsx, so there's no
//          gap where anything other than indigo is ever visible.
// 2200ms - content fade completes, onFinish fires immediately.
const WORDMARK_LINE_DURATION = 300;
const WORDMARK_STAGGER = 120;
const WORDMARK_EASING = Easing.out(Easing.quad);
const TAGLINE_DELAY = 400;
const TAGLINE_DURATION = 400;
const HOLD_MS = 1050;
const FADE_DURATION = 350;
const FADE_START = TAGLINE_DELAY + TAGLINE_DURATION + HOLD_MS;

export function AnimatedIntro({ onFinish }: AnimatedIntroProps) {
  const wordmarkLine1Progress = useSharedValue(0);
  const wordmarkLine2Progress = useSharedValue(0);
  const taglineProgress = useSharedValue(0);
  const contentFadeProgress = useSharedValue(1);

  useEffect(() => {
    wordmarkLine1Progress.value = withTiming(1, {
      duration: WORDMARK_LINE_DURATION,
      easing: WORDMARK_EASING,
    });
    wordmarkLine2Progress.value = withDelay(
      WORDMARK_STAGGER,
      withTiming(1, {
        duration: WORDMARK_LINE_DURATION,
        easing: WORDMARK_EASING,
      }),
    );
    taglineProgress.value = withDelay(
      TAGLINE_DELAY,
      withTiming(1, { duration: TAGLINE_DURATION }),
    );
    contentFadeProgress.value = withDelay(
      FADE_START,
      withTiming(0, { duration: FADE_DURATION }, (finished) => {
        if (finished) runOnJS(onFinish)();
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wordmarkLine1Style = useAnimatedStyle(() => ({
    opacity: wordmarkLine1Progress.value,
    transform: [
      { translateY: interpolate(wordmarkLine1Progress.value, [0, 1], [20, 0]) },
    ],
  }));

  const wordmarkLine2Style = useAnimatedStyle(() => ({
    opacity: wordmarkLine2Progress.value,
    transform: [
      { translateY: interpolate(wordmarkLine2Progress.value, [0, 1], [20, 0]) },
    ],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineProgress.value,
    transform: [
      { translateY: interpolate(taglineProgress.value, [0, 1], [8, 0]) },
    ],
  }));

  const contentFadeStyle = useAnimatedStyle(() => ({
    opacity: contentFadeProgress.value,
  }));

  return (
    <View style={styles.container}>
      <SplashTexture />
      <Animated.View style={contentFadeStyle}>
        <View style={styles.wordmark}>
          <Animated.Text
            style={[styles.wordmarkLine, styles.wordmarkWhite, wordmarkLine2Style]}
          >
            Sharp
          </Animated.Text>
          <Animated.Text
            style={[
              styles.wordmarkLine,
              styles.wordmarkMarigold,
              wordmarkLine1Style,
            ]}
          >
            Sharp
          </Animated.Text>
        </View>
        <Animated.Text style={[styles.tagline, taglineStyle]}>
          Real Slang, Real SA
        </Animated.Text>
      </Animated.View>
    </View>
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
    lineHeight: 60,
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
