import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { theme } from '@/constants/designTheme';

type ProgressBarProps = {
  progress: number; // 0 to 1
};

export function ProgressBar({ progress }: ProgressBarProps) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: progress,
      duration: 350,
      useNativeDriver: false, // width can't animate on the native driver
    }).start();
  }, [progress]);

  return (
    <View style={styles.track}>
      <Animated.View
        style={[
          styles.fill,
          {
            width: widthAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
  },
  fill: {
    height: '100%',
    backgroundColor: theme.colors.marigold,
    borderRadius: theme.radius.pill,
  },
});
