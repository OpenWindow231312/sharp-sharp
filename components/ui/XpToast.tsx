import { theme } from "@/constants/designTheme";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Text } from "./Text";

type XpToastProps = {
  amount: number;
  // Big word on the stamp, e.g. "Lekker". Without it the stamp just
  // shows the XP.
  label?: string;
  onDone: () => void;
};

// A rubber stamp that lands at an angle, holds, then lifts away.
export function XpToast({ amount, label, onDone }: XpToastProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1.6);
  const translateY = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 260 });
    opacity.value = withSequence(
      withTiming(1, { duration: 120 }),
      withTiming(1, { duration: label ? 1000 : 600 }),
      withTiming(0, { duration: 260 }, (finished) => {
        if (finished) runOnJS(onDone)();
      }),
    );
    translateY.value = withSequence(
      withTiming(0, { duration: label ? 1120 : 720 }),
      withTiming(-40, { duration: 260 }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { rotate: "-10deg" },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={[styles.stamp, style]} pointerEvents="none">
      {label ? <Text style={styles.word}>{label.toUpperCase()}</Text> : null}
      <Text style={[styles.xp, !label && styles.xpOnly]}>
        {label ? `SAVED · +${amount} XP` : `+${amount} XP`}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  stamp: {
    position: "absolute",
    top: 110,
    alignSelf: "center",
    zIndex: 50,
    alignItems: "center",
    borderWidth: 4,
    borderColor: theme.colors.highveld,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 22,
    backgroundColor: "rgba(255,248,236,0.94)",
  },
  word: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: 2,
    color: theme.colors.highveld,
  },
  xp: {
    fontFamily: theme.fonts.mono,
    fontSize: 12,
    letterSpacing: 1.5,
    color: theme.colors.highveld,
    marginTop: 2,
  },
  xpOnly: {
    fontSize: 18,
    marginTop: 0,
  },
});
