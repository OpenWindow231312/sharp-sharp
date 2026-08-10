import { View, ViewProps, StyleSheet } from 'react-native';
import { theme } from '../../constants/designTheme';

export function Card({ style, ...rest }: ViewProps) {
  return <View style={[styles.card, style]} {...rest} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    ...theme.shadow.soft,
  },
});
