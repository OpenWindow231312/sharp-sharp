import { StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Card } from './Card';
import { Text } from './Text';
import { theme } from '@/constants/designTheme';
import type { SlangTerm } from '@/types/slangTerm';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;

type SwipeCardProps = {
  term: SlangTerm;
  onSwipe: (direction: 'left' | 'right') => void;
};

export function SwipeCard({ term, onSwipe }: SwipeCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      const passedThreshold = Math.abs(e.translationX) > SWIPE_THRESHOLD;
      if (passedThreshold) {
        const direction = e.translationX > 0 ? 'right' : 'left';
        translateX.value = withTiming(
          direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5,
          { duration: 220 },
          () => runOnJS(onSwipe)(direction)
        );
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-12, 0, 12],
      Extrapolation.CLAMP
    );
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const saveStampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [10, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));

  const skipStampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, -10], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.wrapper, cardStyle]}>
        <Card style={styles.card}>
          <Animated.View style={[styles.stamp, styles.saveStamp, saveStampStyle]}>
            <Text style={styles.stampText}>SAVE</Text>
          </Animated.View>
          <Animated.View style={[styles.stamp, styles.skipStamp, skipStampStyle]}>
            <Text style={styles.stampText}>SKIP</Text>
          </Animated.View>

          <Text variant="muted" style={{ marginBottom: 8 }}>{term.language}</Text>
          <Text variant="display" style={{ marginBottom: 12 }}>{term.term}</Text>
          <Text style={{ marginBottom: 16 }}>{term.meaning}</Text>
          {term.examples && term.examples.length > 0 ? (
            <Text variant="muted" style={{ fontStyle: 'italic' }}>"{term.examples[0]}"</Text>
          ) : null}
          {term.region ? (
            <Text variant="muted" style={{ marginTop: 12 }}>{term.region}</Text>
          ) : null}
          <Text variant="muted" style={{ marginTop: 16 }}>Added by {term.submittedByName}</Text>
        </Card>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    width: '100%',
  },
  card: {
    minHeight: 340,
    justifyContent: 'center',
  },
  stamp: {
    position: 'absolute',
    top: 20,
    borderWidth: 3,
    borderRadius: theme.radius.sm,
    paddingVertical: 4,
    paddingHorizontal: 12,
    zIndex: 10,
  },
  saveStamp: {
    right: 20,
    borderColor: '#2E7D32',
    transform: [{ rotate: '12deg' }],
  },
  skipStamp: {
    left: 20,
    borderColor: '#C0392B',
    transform: [{ rotate: '-12deg' }],
  },
  stampText: {
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: 1,
  },
});
