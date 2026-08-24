import { useEffect, useState } from "react";
import type { StyleProp, TextStyle } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Text } from "./Text";

type TypewriterTextProps = {
  text: string;
  style?: StyleProp<TextStyle>;
  /** ms revealed per character. */
  charDelayMs?: number;
  /** Fires once, the moment the last character is revealed. */
  onDone?: () => void;
  /** Blinking text cursor while typing. Defaults on. */
  cursor?: boolean;
};

export function TypewriterText({
  text,
  style,
  charDelayMs = 28,
  onDone,
  cursor = true,
}: TypewriterTextProps) {
  // The reveal is timed by this shared value on the UI thread; visibleCount
  // is the one bridge back to JS, since Text content (unlike a style) can't
  // be driven purely on the UI thread.
  const progress = useSharedValue(0);
  const hasFiredDone = useSharedValue(false);
  const cursorOpacity = useSharedValue(1);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    progress.value = 0;
    hasFiredDone.value = false;
    setVisibleCount(0);
    progress.value = withTiming(text.length, {
      duration: Math.max(text.length * charDelayMs, 1),
      easing: Easing.linear,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  useAnimatedReaction(
    () => Math.floor(progress.value),
    (count, previous) => {
      if (count !== previous) {
        runOnJS(setVisibleCount)(count);
      }
      if (count >= text.length && !hasFiredDone.value) {
        hasFiredDone.value = true;
        if (onDone) runOnJS(onDone)();
      }
    },
    [text],
  );

  useEffect(() => {
    cursorOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 400 }),
        withTiming(1, { duration: 400 }),
      ),
      -1,
      true,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDone = visibleCount >= text.length;
  const cursorStyle = useAnimatedStyle(() => ({
    opacity: isDone ? 0 : cursorOpacity.value,
  }));

  return (
    <Text style={style}>
      {text.slice(0, visibleCount)}
      {cursor ? <Animated.Text style={cursorStyle}>|</Animated.Text> : null}
    </Text>
  );
}
