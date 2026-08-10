import { TextInput, View, StyleSheet, TextInputProps } from 'react-native';
import { Text } from './Text';
import { theme } from '@/constants/designTheme';

type InputProps = TextInputProps & {
  label?: string;
};

export function Input({ label, style, ...rest }: InputProps) {
  return (
    <View style={{ marginBottom: theme.spacing.md }}>
      {label ? (
        <Text variant="muted" style={{ marginBottom: theme.spacing.xs }}>
          {label}
        </Text>
      ) : null}
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={theme.colors.textMuted}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: theme.tapTarget,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.card,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSize.body,
    color: theme.colors.text,
  },
});
