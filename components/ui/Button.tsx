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
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: isPrimary ? theme.colors.primary : theme.colors.secondary },
        { borderColor: theme.colors.border },
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
      {...rest}
    >
      <Text
        style={{
          color: isPrimary ? theme.colors.primaryText : theme.colors.secondaryText,
          fontSize: theme.fontSize.body,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.8,
  },
});
