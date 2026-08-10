import { Pressable, Text, StyleSheet, PressableProps } from 'react-native';
import { theme } from '@/constants/designTheme';

type ButtonProps = PressableProps & {
  label: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
};

export function Button({ label, variant = 'primary', disabled = false, style, ...rest }: ButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      disabled={disabled}
      style={(state) => [
        styles.base,
        { backgroundColor: isPrimary ? theme.colors.primary : theme.colors.secondary },
        { borderColor: isPrimary ? 'transparent' : theme.colors.indigo },
        isPrimary && !disabled && !state.pressed && styles.primaryShadow,
        state.pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}
    >
      <Text
        style={{
          fontFamily: theme.fonts.bodyBold,
          color: isPrimary ? theme.colors.primaryText : theme.colors.secondaryText,
          fontSize: theme.fontSize.body,
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
    alignItems: 'center',
    justifyContent: 'center',
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
