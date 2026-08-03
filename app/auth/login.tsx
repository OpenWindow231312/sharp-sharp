import { View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { theme } from '@/constants/designTheme';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text variant="display" style={{ marginBottom: 4 }}>
        Sharp Sharp
      </Text>
      <Text variant="muted" style={{ marginBottom: 32 }}>
        Real slang. Real South Africa.
      </Text>

      <Input label="Email" placeholder="your@email.com" autoCapitalize="none" keyboardType="email-address" />
      <Input label="Password" placeholder="Enter your password" secureTextEntry />

      <Button label="Let's go" variant="primary" onPress={() => {}} style={{ marginTop: 8, marginBottom: 16 }} />

      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text variant="muted" style={{ marginHorizontal: 8 }}>or</Text>
        <View style={styles.line} />
      </View>

      <Button label="Continue with Google" variant="secondary" onPress={() => {}} style={{ marginTop: 16, marginBottom: 24 }} />

      <View style={styles.footer}>
        <Text variant="muted">Don't have an account? </Text>
        <Link href="/auth/signup">
          <Text style={{ textDecorationLine: 'underline' }}>Sign up</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 100,
    backgroundColor: theme.colors.background,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
