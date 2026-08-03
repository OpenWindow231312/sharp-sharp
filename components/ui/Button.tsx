import { Pressable, Text, StyleSheet, PressableProps } from 'react-native';
import { theme } from '../../constants/designTheme';

type ButtonProps = PressableProps & {
  label: string;
  variant?: 'primary' | 'secondary';
};

export function Button({ label, variant = 'primary', style, ...rest }: ButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      style={[
        styles.base,
        { backgroundColor: isPrimary ? theme.colors.primary : theme.colors.secondary },
        { borderColor: theme.colors.border },
        style,
      ]}
      {...rest}
    >
      <Text style={{ color: isPrimary ? theme.colors.primaryText : theme.colors.secondaryText, fontSize: theme.fontSize.body }}>
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
});
