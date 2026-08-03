import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { theme } from '../../constants/designTheme';

type AppTextProps = TextProps & {
  variant?: 'body' | 'heading' | 'display' | 'muted';
};

export function Text({ variant = 'body', style, ...rest }: AppTextProps) {
  return <RNText style={[styles[variant], style]} {...rest} />;
}

const styles = StyleSheet.create({
  body: { fontSize: theme.fontSize.body, color: theme.colors.text },
  heading: { fontSize: theme.fontSize.heading, color: theme.colors.text, fontWeight: '600' },
  display: { fontSize: theme.fontSize.display, color: theme.colors.text, fontWeight: '700' },
  muted: { fontSize: theme.fontSize.body, color: theme.colors.textMuted },
});
