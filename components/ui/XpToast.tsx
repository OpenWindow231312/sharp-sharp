import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, runOnJS } from 'react-native-reanimated';
import { Text } from './Text';
import { theme } from '@/constants/designTheme';

type XpToastProps = {
  amount: number;
  label?: string;
  onDone: () => void;
};

export function XpToast({ amount, label, onDone }: XpToastProps) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withSequence(
      withTiming(1, { duration: 150 }),
      withTiming(1, { duration: label ? 900 : 500 }),
      withTiming(0, { duration: 300 }, (finished) => {
        if (finished) runOnJS(onDone)();
      })
    );
    translateY.value = withTiming(-60, { duration: label ? 1350 : 950 });
    scale.value = withTiming(1, { duration: 200 });
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.container, style]} pointerEvents="none">
      <Text style={styles.text}>+{amount} XP</Text>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    zIndex: 50,
    alignItems: 'center',
    backgroundColor: theme.colors.paper,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: theme.radius.pill,
    ...theme.shadow.soft,
  },
  text: { fontFamily: theme.fonts.displayExtraBold, fontSize: 22, color: theme.colors.highveld },
  label: { fontFamily: theme.fonts.bodySemibold, fontSize: 13, color: theme.colors.inkSoft },
});
