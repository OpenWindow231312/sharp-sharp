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
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.body,
    color: theme.colors.text,
  },
});
