import { StyleSheet, Dimensions, View } from 'react-native';
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
import { Chip } from './Chip';
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
  const flip = useSharedValue(0); // 0 = front showing, 180 = back showing

  function toggleFlip() {
    flip.value = withTiming(flip.value === 0 ? 180 : 0, { duration: 450 });
  }

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

  const tap = Gesture.Tap()
    .maxDuration(250)
    .onEnd(() => {
      runOnJS(toggleFlip)();
    });

  // Race, not Simultaneous: whichever gesture recognizes first "wins" and
  // cancels the other — a still finger reads as Tap, real horizontal
  // movement reads as Pan, so they never both fire for one touch.
  const composedGesture = Gesture.Race(pan, tap);

  const dragStyle = useAnimatedStyle(() => {
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

  const frontFaceStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateY: `${flip.value}deg` }],
  }));

  const backFaceStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateY: `${flip.value - 180}deg` }],
  }));

  const saveStampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [10, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));

  const skipStampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, -10], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.wrapper, dragStyle]}>
        <Animated.View style={[styles.stamp, styles.saveStamp, saveStampStyle]}>
          <Text style={styles.stampText}>SAVE</Text>
        </Animated.View>
        <Animated.View style={[styles.stamp, styles.skipStamp, skipStampStyle]}>
          <Text style={styles.stampText}>SKIP</Text>
        </Animated.View>

        {/* Front face */}
        <Animated.View style={[styles.face, frontFaceStyle]}>
          <Card style={styles.card}>
            <View style={styles.bubbleRow}>
              <Chip label={term.language} selected />
            </View>
            <View style={styles.frontCenter}>
              <Text style={styles.termText}>{term.term}</Text>
              <Text variant="muted" style={styles.flipHint}>↻ Tap to reveal meaning</Text>
            </View>
          </Card>
        </Animated.View>

        {/* Back face */}
        <Animated.View style={[styles.face, styles.backFacePosition, backFaceStyle]}>
          <Card style={styles.card}>
            <View style={styles.bubbleRow}>
              <Chip label={term.language} selected />
            </View>
            <Text variant="muted" style={{ marginBottom: 4 }}>Meaning</Text>
            <Text style={styles.meaningText}>{term.meaning}</Text>
            {term.examples && term.examples.length > 0 ? (
              <Text variant="muted" style={styles.exampleText}>"{term.examples[0]}"</Text>
            ) : null}
            {term.region ? (
              <Text variant="muted" style={{ marginTop: 10 }}>{term.region}</Text>
            ) : null}
            <Text variant="muted" style={styles.addedBy}>Added by {term.submittedByName}</Text>
          </Card>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    width: '100%',
    minHeight: 400,
  },
  face: {
    backfaceVisibility: 'hidden',
    width: '100%',
  },
  backFacePosition: {
    position: 'absolute',
    top: 0,
  },
  card: {
    minHeight: 400,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  frontCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  termText: {
    fontSize: 44,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  flipHint: {
    fontSize: 13,
  },
  meaningText: {
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 16,
  },
  exampleText: {
    fontStyle: 'italic',
    fontSize: 15,
  },
  addedBy: {
    marginTop: 'auto',
    paddingTop: 16,
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
