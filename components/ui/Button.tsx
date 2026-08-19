import { theme } from "@/constants/designTheme";
import { Pressable, PressableProps, StyleSheet, Text, View } from "react-native";

type ButtonProps = PressableProps & {
  label: string;
  variant?: "primary" | "secondary";
  size?: "default" | "compact";
  disabled?: boolean;
};

export function Button({
  label,
  variant = "primary",
  size = "default",
  disabled = false,
  style,
  ...rest
}: ButtonProps) {
  const isPrimary = variant === "primary";
  const isCompact = size === "compact";
  const shadowHeight = isCompact ? 3 : 4;

  const fillColor = isPrimary ? theme.colors.indigo : theme.colors.marigold;
  // Marigold has no "deep" counterpart in the palette, so its shadow is an
  // ink-tinted rgba instead — same trick used in the design-system doc.
  const shadowColor = isPrimary ? theme.colors.indigoDeep : "rgba(36,28,21,0.35)";
  const textColor = isPrimary ? theme.colors.primaryText : theme.colors.ink;

  return (
    <View
      style={
        !disabled && {
          backgroundColor: shadowColor,
          borderRadius: theme.radius.pill,
        }
      }
    >
      <Pressable
        disabled={disabled}
        style={(state) => [
          styles.base,
          isCompact && styles.compact,
          {
            backgroundColor: disabled ? theme.colors.surface : fillColor,
          },
          !disabled &&
            (state.pressed
              ? { marginBottom: 0, transform: [{ translateY: shadowHeight }] }
              : { marginBottom: shadowHeight, transform: [{ translateY: 0 }] }),
          typeof style === "function" ? style(state) : style,
        ]}
        {...rest}
      >
        <Text
          style={{
            fontFamily: theme.fonts.bodyBold,
            color: disabled ? theme.colors.textMuted : textColor,
            fontSize: isCompact ? 14 : theme.fontSize.body,
          }}
        >
          {label}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: theme.tapTarget,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  compact: {
    minHeight: 40,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
});
