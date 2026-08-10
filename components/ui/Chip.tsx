import { useEffect, useRef } from 'react';
import { Pressable, Animated, StyleSheet, type ViewStyle } from 'react-native';
import { Text } from './Text';
import { theme } from '@/constants/designTheme';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  delay?: number;
  style?: ViewStyle;
};

export function Chip({ label, selected = false, onPress, onRemove, delay = 0, style }: ChipProps) {
  const entrance = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const isFirstRender = useRef(true);

  // Pop-in animation when the chip first appears
  useEffect(() => {
    Animated.spring(entrance, {
      toValue: 1,
      delay,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, []);

  // Small bounce when the chip becomes selected (skipped on first mount,
  // so it doesn't clash with the pop-in animation above)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (selected) {
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 100, useNativeDriver: true }),
        Animated.spring(pulse, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start();
    }
  }, [selected]);

  return (
    <Animated.View
      style={{
        opacity: entrance,
        transform: [{ scale: Animated.multiply(entrance, pulse) }],
      }}
    >
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={[
          styles.chip,
          {
            backgroundColor: selected ? theme.colors.primary : theme.colors.secondary,
            borderColor: selected ? theme.colors.primary : theme.colors.indigo,
          },
          style,
        ]}
      >
        <Text
          style={{
            fontFamily: theme.fonts.bodySemibold,
            color: selected ? theme.colors.primaryText : theme.colors.secondaryText,
          }}
        >
          {label}
        </Text>
        {onRemove ? (
          <Pressable onPress={onRemove} hitSlop={8} style={{ marginLeft: 6 }}>
            <Text
              style={{
                fontFamily: theme.fonts.bodyBold,
                color: selected ? theme.colors.primaryText : theme.colors.secondaryText,
              }}
            >
              ×
            </Text>
          </Pressable>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: theme.radius.pill,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
});
