import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, runOnJS } from 'react-native-reanimated';
import { Text } from './Text';

type XpToastProps = {
  amount: number;
  onDone: () => void;
};

export function XpToast({ amount, onDone }: XpToastProps) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withSequence(
      withTiming(1, { duration: 150 }),
      withTiming(1, { duration: 500 }),
      withTiming(0, { duration: 300 }, (finished) => {
        if (finished) runOnJS(onDone)();
      })
    );
    translateY.value = withTiming(-60, { duration: 950 });
    scale.value = withTiming(1, { duration: 200 });
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.container, style]} pointerEvents="none">
      <Text style={styles.text}>+{amount} XP</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 100, alignSelf: 'center', zIndex: 50 },
  text: { fontSize: 22, fontWeight: '800', color: '#2E7D32' },
});
