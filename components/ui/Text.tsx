import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { theme } from '../../constants/designTheme';

type AppTextProps = TextProps & {
  variant?: 'body' | 'heading' | 'display' | 'muted';
};

export function Text({ variant = 'body', style, ...rest }: AppTextProps) {
  return <RNText style={[styles[variant], style]} {...rest} />;
}

const styles = StyleSheet.create({
  body: { fontFamily: theme.fonts.body, fontSize: theme.fontSize.body, color: theme.colors.text },
  heading: {
    fontFamily: theme.fonts.displayBold,
    fontSize: theme.fontSize.heading,
    color: theme.colors.text,
  },
  display: {
    fontFamily: theme.fonts.displayExtraBold,
    fontSize: theme.fontSize.display,
    color: theme.colors.text,
  },
  muted: { fontFamily: theme.fonts.body, fontSize: theme.fontSize.body, color: theme.colors.textMuted },
});
