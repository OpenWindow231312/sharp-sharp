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
            backgroundColor: selected ? theme.colors.beadwork : theme.colors.card,
            borderColor: theme.colors.beadwork,
          },
          style,
        ]}
      >
        <Text
          style={{
            flexShrink: 1,
            fontFamily: theme.fonts.bodySemibold,
            fontSize: small ? 10 : 13,
            color: selected ? theme.colors.card : theme.colors.beadwork,
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
                fontSize: small ? 10 : 13,
                color: selected ? theme.colors.card : theme.colors.beadwork,
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
    alignItems: "flex-start",
    borderWidth: 1.25,
    borderRadius: theme.radius.pill,
    paddingVertical: 7,
    paddingHorizontal: 13,
    maxWidth: "100%",
  },
  chipSmall: {
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderWidth: 1,
  },
});
