import { theme } from "@/constants/designTheme";
import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, type ViewStyle } from "react-native";
import { Text } from "./Text";

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  delay?: number;
  small?: boolean;
  style?: ViewStyle;
};

export function Chip({
  label,
  selected = false,
  onPress,
  onRemove,
  delay = 0,
  small = false,
  style,
}: ChipProps) {
  const entrance = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const isFirstRender = useRef(true);

  useEffect(() => {
    Animated.spring(entrance, {
      toValue: 1,
      delay,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (selected) {
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.12,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(pulse, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
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
          small && styles.chipSmall,
          {
            backgroundColor: selected
              ? theme.colors.primary
              : theme.colors.secondary,
            borderColor: selected ? theme.colors.primary : theme.colors.indigo,
          },
          style,
        ]}
      >
        <Text
          style={{
            flexShrink: 1, // lets the text wrap instead of forcing the pill wider than its container
            fontFamily: theme.fonts.bodySemibold,
            fontSize: small ? 11 : theme.fontSize.body,
            color: selected
              ? theme.colors.primaryText
              : theme.colors.secondaryText,
          }}
        >
          {label}
        </Text>
        {onRemove ? (
          <Pressable
            onPress={onRemove}
            hitSlop={8}
            style={{ flexShrink: 0, marginLeft: small ? 4 : 6 }}
          >
            <Text
              style={{
                fontFamily: theme.fonts.bodyBold,
                fontSize: small ? 11 : theme.fontSize.body,
                color: selected
                  ? theme.colors.primaryText
                  : theme.colors.secondaryText,
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
    flexDirection: "row",
    alignItems: "flex-start", // top-aligns the × against wrapped multi-line text
    borderWidth: 1.5,
    borderRadius: theme.radius.pill,
    paddingVertical: 10,
    paddingHorizontal: 16,
    maxWidth: "100%", // the actual overflow fix — caps the pill at its container's width
  },
  chipSmall: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1.2,
  },
});
