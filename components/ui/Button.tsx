import { theme } from "@/constants/designTheme";
import { Pressable, PressableProps, StyleSheet, Text } from "react-native";

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

  return (
    <Pressable
      disabled={disabled}
      style={(state) => [
        styles.base,
        isCompact && styles.compact,
        {
          backgroundColor: isPrimary
            ? theme.colors.primary
            : theme.colors.secondary,
        },
        { borderColor: isPrimary ? "transparent" : theme.colors.indigo },
        isPrimary && !disabled && !state.pressed && styles.primaryShadow,
        state.pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        typeof style === "function" ? style(state) : style,
      ]}
      {...rest}
    >
      <Text
        style={{
          fontFamily: theme.fonts.bodyBold,
          color: isPrimary
            ? theme.colors.primaryText
            : theme.colors.secondaryText,
          fontSize: isCompact ? 14 : theme.fontSize.body,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: theme.tapTarget,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.pill,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  compact: {
    minHeight: 40,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1.5,
  },
  primaryShadow: theme.shadow.card,
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.92,
  },
});
