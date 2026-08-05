import { View, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { theme } from '@/constants/designTheme';
import { getAuthErrorMessage } from '@/utils/authErrors';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleLogin() {
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/(tabs)');
    } catch (error) {
      setErrorMsg(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text variant="display" style={{ marginBottom: 4 }}>
        Sharp Sharp
      </Text>
      <Text variant="muted" style={{ marginBottom: 32 }}>
        Real slang. Real South Africa.
      </Text>
      <Input
        label="Email"
        placeholder="your@email.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Input
        label="Password"
        placeholder="Enter your password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {errorMsg ? (
        <Text style={{ color: '#C0392B', marginBottom: 8 }}>{errorMsg}</Text>
      ) : null}
      <Button
        label={isLoading ? 'Logging in...' : "Let's go"}
        variant="primary"
        disabled={isLoading}
        onPress={handleLogin}
        style={{ marginTop: 8, marginBottom: 16 }}
      />
      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text variant="muted" style={{ marginHorizontal: 8 }}>or</Text>
        <View style={styles.line} />
      </View>
      <Button
        label="Continue with Google (coming soon)"
        variant="secondary"
        disabled
        onPress={() => {}}
        style={{ marginTop: 16, marginBottom: 24 }}
      />
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
