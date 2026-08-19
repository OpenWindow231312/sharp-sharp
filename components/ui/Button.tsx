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

  const fillColor = isPrimary ? theme.colors.indigo : theme.colors.marigold;
  const textColor = isPrimary ? theme.colors.primaryText : theme.colors.ink;

  return (
    <Pressable
      disabled={disabled}
      style={(state) => [
        styles.base,
        isCompact && styles.compact,
        { backgroundColor: disabled ? theme.colors.surface : fillColor },
        state.pressed && !disabled && styles.pressed,
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
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
