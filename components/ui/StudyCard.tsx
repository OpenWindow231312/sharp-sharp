import { StyleSheet, View, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { Text } from './Text';
import { theme } from '@/constants/designTheme';
import type { SlangTerm } from '@/types/slangTerm';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;

type StudyCardProps = {
  term: SlangTerm;
  onSwipe: (direction: 'left' | 'right') => void;
};

export function StudyCard({ term, onSwipe }: StudyCardProps) {
  const translateX = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > SWIPE_THRESHOLD) {
        const direction = e.translationX > 0 ? 'right' : 'left';
        translateX.value = withTiming(
          direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH,
          { duration: 200 },
          () => runOnJS(onSwipe)(direction)
        );
      } else {
        translateX.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.row, cardStyle]}>
        <View style={styles.side}>
          <Text variant="muted" style={{ marginBottom: 8 }}>{term.language}</Text>
          <Text variant="display" style={styles.termText}>{term.term}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.side}>
          <Text variant="muted" style={{ marginBottom: 4 }}>Meaning</Text>
          <Text style={{ marginBottom: 16 }}>{term.meaning}</Text>
          {term.examples && term.examples.length > 0 ? (
            <View style={{ marginBottom: 16 }}>
              <Text variant="muted" style={{ marginBottom: 4 }}>
                {term.examples.length > 1 ? 'Examples' : 'Example'}
              </Text>
              {term.examples.map((example, index) => (
                <View key={index} style={index > 0 ? { marginTop: 8 } : undefined}>
                  <Text style={{ fontStyle: 'italic' }}>&quot;{example.sentence}&quot;</Text>
                  {example.context ? (
                    <Text variant="muted" style={{ fontSize: 12, marginTop: 2 }}>
                      {example.context}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}
          {term.region ? <Text variant="muted">{term.region}</Text> : null}
          <Text variant="muted" style={{ marginTop: 12 }}>Added by {term.submittedByName}</Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  row: { flex: 1, flexDirection: 'row' },
  side: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  divider: { width: 1, backgroundColor: theme.colors.border },
  termText: { fontSize: 40 },
});
